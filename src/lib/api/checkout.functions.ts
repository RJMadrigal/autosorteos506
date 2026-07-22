import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseServer, logOrderAction } from "../supabase.server";
import { sendStatusEmail } from "./email.server";

const CheckoutSchema = z.object({
  nombre: z.string().min(1),
  cedula: z.string().optional(),
  telefono: z.string().min(1),
  email: z.string().optional(),
  referencia: z.string().min(1),
  numbers: z.array(z.string()),
  total: z.number(),
  receiptPath: z.string().min(1),
  sessionId: z.string().min(1),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

const UploadUrlSchema = z.object({ fileExt: z.string().min(1) });
export const getUploadUrl = createServerFn({ method: "POST" })
  .inputValidator(UploadUrlSchema)
  .handler(async ({ data }) => {
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `LW-${timestamp}-${randomStr}`;
    const storageName = `${orderId}.${data.fileExt}`;

    const { data: uploadData, error } = await supabaseServer
      .storage
      .from("receipts")
      .createSignedUploadUrl(storageName);

    if (error) {
      console.error("Signed URL error:", error);
      throw new Error(`Error al crear ruta de subida: ${error.message}`);
    }

    return { 
      signedUrl: uploadData.signedUrl, 
      path: uploadData.path,
      orderId 
    };
  });

export const processCheckout = createServerFn({ method: "POST" })
  .inputValidator(CheckoutSchema)
  .handler(async ({ data }) => {
    const {
      nombre, cedula, telefono, email, referencia,
      numbers, total, receiptPath, sessionId
    } = data;

    // Retrieve orderId from the receipt path (e.g. LW-XXXX-YYYY.jpg)
    const orderId = receiptPath.split('.')[0];

    // 1. Check if the numbers belong to this session via the RPC
    const { data: confirmed, error: rpcError } = await supabaseServer
      .rpc("confirm_order_tickets", {
        p_numbers: numbers,
        p_session_id: sessionId,
        p_order_id: orderId
      });

    if (rpcError || !confirmed) {
      console.error("Concurrency error or RPC failed:", rpcError);
      throw new Error("Tus números ya no están disponibles o la reserva expiró. Por favor, selecciona de nuevo.");
    }

    // 2. Get public URL of the uploaded receipt
    const { data: { publicUrl } } = supabaseServer
      .storage
      .from("receipts")
      .getPublicUrl(receiptPath);

    // 3. Insert order into DB
    const { error: dbError } = await supabaseServer
      .from("orders")
      .insert({
        order_id: orderId,
        raffle_name: "Sorteo AutoSorteos506",
        numbers: numbers,
        total: total,
        nombre: nombre,
        cedula: cedula || null,
        telefono: telefono.replace(/\D/g, ""),
        email: email ? email.trim().toLowerCase() : null,
        referencia: referencia,
        status: "pendiente",
        receipt_url: publicUrl,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Rollback
      await supabaseServer.storage.from("receipts").remove([receiptPath]);
      // Note: tickets are left as "vendido", an admin might need to clean them up,
      // or we could rollback to 'reservado'. But DB insert failures are rare.
      throw new Error(`Error al guardar la orden: ${dbError.message}`);
    }

    // 3.5 Log the creation
    await logOrderAction(orderId, "creada", { numbers, total, nombre, email, telefono, referencia }, "cliente");

    // 4. Send confirmation email (non-blocking on failure)
    if (email) {
      await sendStatusEmail(email, nombre, orderId, numbers, total, "pendiente").catch((err) => {
        console.error("Email send failed (non-critical):", err);
      });
    }

    return {
      success: true,
      orderId,
      receiptUrl: publicUrl,
    };
  });
