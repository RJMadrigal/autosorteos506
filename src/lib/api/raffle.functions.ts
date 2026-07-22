import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { z } from "zod";
import { supabaseServer, logOrderAction } from "../supabase.server";
import { sendStatusEmail } from "./email.server";

// ─────────────────────────────────────────────────────────────
// AUTH HELPER: Valida el JWT del usuario sin requerir service role key
// ─────────────────────────────────────────────────────────────
async function validateAdminToken(token: string): Promise<void> {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: { transport: ws },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) {
    throw new Error("No autenticado: " + (error?.message || "token inválido"));
  }
}


// ─────────────────────────────────────────────────────────────
// 1. GET SOLD NUMBERS (used by numeros grid)
// ─────────────────────────────────────────────────────────────
// Cache in-memory for serverless bursts (10 seconds TTL)
let soldCache: { data: number[], ts: number } | null = null;
const CACHE_TTL = 10000;

export const getSoldNumbers = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (soldCache && now - soldCache.ts < CACHE_TTL) {
    return { sold: soldCache.data };
  }

  // Sold = anything in tickets table that is not a clean reservation expired
  const { data, error } = await supabaseServer
    .from("tickets")
    .select("number")
    .or(`status.eq.vendido,status.eq.bloqueado,and(status.eq.reservado,expires_at.gt.${new Date().toISOString()})`);

  if (error) {
    console.error("[getSoldNumbers] error:", error.message);
  }

  const sold: number[] = [];
  for (const row of data ?? []) {
    const parsed = parseInt(row.number, 10);
    if (!isNaN(parsed)) sold.push(parsed);
  }

  soldCache = { data: sold, ts: now };
  return { sold };
});

// ─────────────────────────────────────────────────────────────
// 2. GET RAFFLE STATS (used by homepage Hero & Admin)
// ─────────────────────────────────────────────────────────────
let statsCache: { data: any, ts: number } | null = null;

export const getRaffleStats = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const now = Date.now();
    if (statsCache && now - statsCache.ts < CACHE_TTL) {
      return statsCache.data;
    }

    const { data: orderData, error: orderErr } = await supabaseServer
      .from("orders")
      .select("total, status");

    if (orderErr) throw new Error("Order error: " + orderErr.message);

    let revenue = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let rejectedCount = 0;
    let totalOrders = 0;

    for (const row of orderData ?? []) {
      totalOrders++;
      if (row.status === "rechazado") {
        rejectedCount++;
        continue;
      }
      if (row.status === "pendiente") pendingCount++;
      if (row.status === "confirmado") confirmedCount++;
      revenue += row.total ?? 0;
    }

    const { count: soldCount, error: soldErr } = await supabaseServer
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .in("status", ["vendido", "bloqueado"]);
    
    if (soldErr) throw new Error("Sold error: " + soldErr.message);

    const { count: blockedCount, error: blockErr } = await supabaseServer
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "bloqueado");
    
    if (blockErr) throw new Error("Block error: " + blockErr.message);

    const result = {
      soldCount: soldCount ?? 0,
      revenue,
      pendingCount,
      confirmedCount,
      rejectedCount,
      totalOrders,
      blockedCount: blockedCount ?? 0,
    };

    statsCache = { data: result, ts: now };
    return result;
  } catch (err: any) {
    console.error("[getRaffleStats error]", err.message);
    // Return a structured error instead of throwing a 500
    return { error: err.message, soldCount: 0, revenue: 0, pendingCount: 0, confirmedCount: 0, rejectedCount: 0, totalOrders: 0, blockedCount: 0 };
  }
});

// ─────────────────────────────────────────────────────────────
// 3. SEARCH ORDERS (used by Seguimiento page)
// ─────────────────────────────────────────────────────────────
const SearchSchema = z.object({
  email: z.string().optional(),
  telefono: z.string().optional(),
});

export const searchOrders = createServerFn({ method: "POST" })
  .validator(SearchSchema)
  .handler(async ({ data }) => {
    const { email, telefono } = data;
    const emailClean = email?.trim().toLowerCase() || "";
    const telClean = telefono?.replace(/\D/g, "") || "";

    if (!emailClean && !telClean) {
      return { orders: [] };
    }

    // Build query - Supabase doesn't have OR easily, so we do two queries
    let orders: any[] = [];

    if (emailClean) {
      const { data: byEmail } = await supabaseServer
        .from("orders")
        .select("*")
        .eq("email", emailClean)
        .order("created_at", { ascending: false });
      if (byEmail) orders.push(...byEmail);
    }

    if (telClean) {
      const { data: byTel } = await supabaseServer
        .from("orders")
        .select("*")
        .eq("telefono", telClean)
        .order("created_at", { ascending: false });
      if (byTel) {
        // Deduplicate by order_id
        const existingIds = new Set(orders.map((o: any) => o.order_id));
        for (const o of byTel) {
          if (!existingIds.has(o.order_id)) orders.push(o);
        }
      }
    }

    return { orders };
  });

// ─────────────────────────────────────────────────────────────
// 4. ADMIN: GET ALL ORDERS
// ─────────────────────────────────────────────────────────────
const AdminOrdersSchema = z.object({
  token: z.string().min(1),
});

export const getAdminOrders = createServerFn({ method: "POST" })
  .validator(AdminOrdersSchema)
  .handler(async ({ data }) => {
    try {
      await validateAdminToken(data.token);


      const { data: orders, error } = await supabaseServer
        .from("orders")
        .select(`
          *,
          order_logs(count)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[getAdminOrders]", error.message);
        throw new Error("Error al obtener órdenes: " + error.message);
      }

      // Get manually blocked numbers from tickets table
      const { data: blockedTickets } = await supabaseServer
        .from("tickets")
        .select("number")
        .eq("status", "bloqueado");

      const blocked = (blockedTickets ?? []).map(t => ({
        id: t.number,
        number: t.number,
        reason: "",
        created_at: new Date().toISOString()
      }));

      return { orders: orders ?? [], blocked };
    } catch (err: any) {
      console.error("[getAdminOrders error]", err.message);
      return { error: err.message, orders: [], blocked: [] };
    }
  });

// ─────────────────────────────────────────────────────────────
// 4.5 ADMIN: GET ORDER LOGS
// ─────────────────────────────────────────────────────────────
const OrderLogsSchema = z.object({
  token: z.string().min(1),
  orderId: z.string().min(1),
});

export const getOrderLogs = createServerFn({ method: "POST" })
  .validator(OrderLogsSchema)
  .handler(async ({ data }) => {
    try {
      await validateAdminToken(data.token);

      const { data: logs, error } = await supabaseServer
        .from("order_logs")
        .select("*")
        .eq("order_id", data.orderId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return { logs: logs ?? [] };
    } catch (err: any) {
      console.error("[getOrderLogs error]", err.message);
      return { error: err.message, logs: [] };
    }
  });

// ─────────────────────────────────────────────────────────────
// 5. ADMIN: UPDATE ORDER STATUS
// ─────────────────────────────────────────────────────────────
const UpdateStatusSchema = z.object({
  token: z.string().min(1),
  orderId: z.string().min(1),
  status: z.enum(["pendiente", "confirmado", "rechazado"]),
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator(UpdateStatusSchema)
  .handler(async ({ data }) => {
    await validateAdminToken(data.token);

    const { data: order } = await supabaseServer
      .from("orders")
      .select("status, numbers, email, nombre, total")
      .eq("order_id", data.orderId)
      .single();

    // Si estaba rechazada y la quieren confirmar/pendiente, hay que re-capturar los números
    if (order?.status === "rechazado" && (data.status === "confirmado" || data.status === "pendiente")) {
      const { data: existingTickets } = await supabaseServer
        .from("tickets")
        .select("number, status, expires_at")
        .in("number", order.numbers);
      
      const taken: string[] = [];
      const now = new Date();
      for (const t of existingTickets || []) {
         const expiresAt = t.expires_at ? new Date(t.expires_at) : new Date(0);
         if (t.status === "vendido" || t.status === "bloqueado" || (t.status === "reservado" && expiresAt > now)) {
             taken.push(t.number);
         }
      }
      
      if (taken.length > 0) {
        // En lugar de arrojar error, retornamos objeto de conflicto para el frontend
        return { success: false, conflict: true, takenNumbers: taken, originalNumbers: order.numbers };
      }
      
      // Si están libres, los capturamos
      const rows = order.numbers.map((n: string) => ({
        number: n,
        status: 'vendido',
        order_id: data.orderId,
      }));
      await supabaseServer.from("tickets").upsert(rows, { onConflict: "number" });
    }

    const { error } = await supabaseServer
      .from("orders")
      .update({ status: data.status })
      .eq("order_id", data.orderId);

    if (error) {
      console.error("[updateOrderStatus]", error.message);
      throw new Error("Error al actualizar estado");
    }

    if (order?.status !== data.status) {
      await logOrderAction(data.orderId, "estado_actualizado", { from: order?.status, to: data.status }, "admin");
    }

    if (data.status === "rechazado" && order?.numbers) {
      const { error: ticketError } = await supabaseServer
        .from("tickets")
        .delete()
        .in("number", order.numbers);
        
      if (ticketError) {
        console.error("Error liberating tickets:", ticketError);
      }
    }

    if (order?.email) {
      await sendStatusEmail(order.email, order.nombre, data.orderId, order.numbers, order.total, data.status).catch(err => {
        console.error("Error sending status email:", err);
      });
    }

    return { success: true };
  });

// ─────────────────────────────────────────────────────────────
// 5.0.5 ADMIN: EDIT ORDER DETAILS
// ─────────────────────────────────────────────────────────────
const UpdateDetailsSchema = z.object({
  token: z.string().min(1),
  orderId: z.string().min(1),
  newNumbers: z.array(z.string()),
  newTotal: z.number(),
  nombre: z.string().min(1),
  cedula: z.string(),
  telefono: z.string().min(1),
  email: z.string(),
  referencia: z.string().min(1),
});

export const updateOrderDetails = createServerFn({ method: "POST" })
  .validator(UpdateDetailsSchema)
  .handler(async ({ data }) => {
    await validateAdminToken(data.token);

    // Get old details for logging
    const { data: oldOrder } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("order_id", data.orderId)
      .single();

    // 1. Update tickets and total via RPC
    const { data: updatedTickets, error: rpcError } = await supabaseServer.rpc("update_order_tickets", {
      p_order_id: data.orderId,
      p_new_numbers: data.newNumbers,
      p_new_total: data.newTotal
    });

    if (rpcError) {
      console.error("[updateOrderDetails RPC error]", rpcError);
      throw new Error(rpcError.message || "Error al actualizar los números");
    }

    // 2. Update string fields
    const { error: updateError } = await supabaseServer
      .from("orders")
      .update({
        nombre: data.nombre,
        cedula: data.cedula,
        telefono: data.telefono,
        email: data.email,
        referencia: data.referencia
      })
      .eq("order_id", data.orderId);

    if (updateError) {
      throw new Error("Error al actualizar la información de contacto.");
    }

    // 3. Log the change
    await logOrderAction(data.orderId, "editada", { 
      from: oldOrder, 
      to: { 
        nombre: data.nombre, 
        cedula: data.cedula, 
        telefono: data.telefono, 
        email: data.email, 
        referencia: data.referencia, 
        numbers: data.newNumbers, 
        total: data.newTotal 
      } 
    }, "admin");

    return { success: true };
  });

// ─────────────────────────────────────────────────────────────
// 5.1 ADMIN: REBUILD AND CONFIRM ORDER (CONFLICT RESOLUTION)
// ─────────────────────────────────────────────────────────────
const RebuildOrderSchema = z.object({
  token: z.string().min(1),
  orderId: z.string().min(1),
  newNumbers: z.array(z.string()),
});

export const rebuildAndConfirmOrder = createServerFn({ method: "POST" })
  .validator(RebuildOrderSchema)
  .handler(async ({ data }) => {
    await validateAdminToken(data.token);

    // 1. Check if the new numbers are available
    const { data: orderInfo } = await supabaseServer
      .from("orders")
      .select("email, nombre, total")
      .eq("order_id", data.orderId)
      .single();

    const { data: existingTickets } = await supabaseServer
      .from("tickets")
      .select("number, status, expires_at")
      .in("number", data.newNumbers);
    
    const taken: string[] = [];
    const now = new Date();
    for (const t of existingTickets || []) {
       const expiresAt = t.expires_at ? new Date(t.expires_at) : new Date(0);
       if (t.status === "vendido" || t.status === "bloqueado" || (t.status === "reservado" && expiresAt > now)) {
           taken.push(t.number);
       }
    }
    
    if (taken.length > 0) {
      throw new Error(`Los siguientes números no están disponibles: ${taken.join(", ")}`);
    }

    // 2. Lock the new numbers
    const rows = data.newNumbers.map((n: string) => ({
      number: n,
      status: 'vendido',
      order_id: data.orderId,
    }));
    await supabaseServer.from("tickets").upsert(rows, { onConflict: "number" });

    // 3. Update the order with new numbers and confirmed status
    const { error } = await supabaseServer
      .from("orders")
      .update({ 
        status: "confirmado", 
        numbers: data.newNumbers,
        // we might also need to update 'total' if the length changed, but in a real case we would, for now let's assume they pick the same amount, or we update it:
        total: data.newNumbers.length * 4000 // based on 4000 ticket price
      })
      .eq("order_id", data.orderId);

    if (error) {
      console.error("[rebuildAndConfirmOrder]", error.message);
      throw new Error("Error al reconstruir la orden");
    }

    if (orderInfo?.email) {
      await sendStatusEmail(orderInfo.email, orderInfo.nombre, data.orderId, data.newNumbers, data.newNumbers.length * 4000, "confirmado").catch(err => {
        console.error("Error sending rebuild email:", err);
      });
    }

    return { success: true };
  });

// ─────────────────────────────────────────────────────────────
// 6. ADMIN: BLOCK / UNBLOCK NUMBERS
// ─────────────────────────────────────────────────────────────
const BlockSchema = z.object({
  token: z.string().min(1),
  numbers: z.array(z.string()),
  reason: z.string().optional(),
});

export const blockNumbers = createServerFn({ method: "POST" })
  .validator(BlockSchema)
  .handler(async ({ data }) => {
    await validateAdminToken(data.token);

    const { data: existing } = await supabaseServer
      .from("tickets")
      .select("number, status, expires_at")
      .in("number", data.numbers);

    if (existing && existing.length > 0) {
      const now = new Date();
      const conflicts = existing.filter(t => {
        if (t.status === "vendido") return true;
        if (t.status === "reservado" && t.expires_at && new Date(t.expires_at) > now) return true;
        return false;
      });
      if (conflicts.length > 0) {
        throw new Error(`No se puede bloquear: ${conflicts.map(c => c.number).join(", ")} están vendidos o en proceso de compra.`);
      }
    }

    const rows = data.numbers.map((n) => ({
      number: n,
      status: "bloqueado",
    }));

    const { error } = await supabaseServer
      .from("tickets")
      .upsert(rows, { onConflict: "number" });

    if (error) {
      console.error("[blockNumbers]", error.message);
      throw new Error("Error al bloquear números");
    }

    return { success: true };
  });

const UnblockSchema = z.object({
  token: z.string().min(1),
  numbers: z.array(z.string()),
});

export const unblockNumbers = createServerFn({ method: "POST" })
  .validator(UnblockSchema)
  .handler(async ({ data }) => {
    await validateAdminToken(data.token);

    const { error } = await supabaseServer
      .from("tickets")
      .delete()
      .in("number", data.numbers)
      .eq("status", "bloqueado");

    if (error) {
      console.error("[unblockNumbers]", error.message);
      throw new Error("Error al desbloquear números");
    }

    return { success: true };
  });

// ─────────────────────────────────────────────────────────────
// 7. RESERVATIONS: Create / Release
// ─────────────────────────────────────────────────────────────
const ReserveSchema = z.object({
  numbers: z.array(z.string()),
  sessionId: z.string().min(1),
});

export const reserveNumbers = createServerFn({ method: "POST" })
  .validator(ReserveSchema)
  .handler(async ({ data }) => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: reserved, error } = await supabaseServer
      .rpc("reserve_tickets", {
        p_numbers: data.numbers,
        p_session_id: data.sessionId,
        p_expires_at: expiresAt
      });

    if (error || !reserved) {
      console.error("[reserveNumbers]", error);
      throw new Error("No se pudieron reservar los números (posiblemente tomados)");
    }

    return { success: true, expiresAt };
  });

const ReleaseSchema = z.object({ sessionId: z.string().min(1) });
export const releaseReservation = createServerFn({ method: "POST" })
  .validator(ReleaseSchema)
  .handler(async ({ data }) => {
    await supabaseServer.rpc("release_session_tickets", {
      p_session_id: data.sessionId
    });

    return { success: true };
  });
