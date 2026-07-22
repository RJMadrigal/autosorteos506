import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";

if (!resendApiKey) {
  console.warn("Falta la variable de entorno RESEND_API_KEY.");
}

export const resend = new Resend(resendApiKey);

export async function sendStatusEmail(
  to: string,
  name: string,
  orderId: string,
  numbers: string[],
  total: number,
  status: "pendiente" | "confirmado" | "rechazado"
) {
  try {
    let subject = "";
    let statusText = "";
    let bodyText = "";
    let color = "#d4af37";

    if (status === "pendiente") {
      subject = `Confirmación de números - Orden ${orderId}`;
      statusText = "Pendiente de Validación";
      bodyText = "Hemos recibido tu comprobante de pago. Tu orden se encuentra <strong>Pendiente de Validación</strong>. En cuanto nuestro equipo verifique el comprobante, el estado se actualizará a Confirmado.";
    } else if (status === "confirmado") {
      subject = `¡Orden Confirmada! - Orden ${orderId}`;
      statusText = "Confirmado";
      color = "#10b981"; // Success green
      bodyText = "¡Buenas noticias! Tu pago ha sido validado exitosamente. Tus números están oficialmente asegurados y participando en el sorteo.";
    } else if (status === "rechazado") {
      subject = `Problema con tu Orden - Orden ${orderId}`;
      statusText = "Rechazado";
      color = "#ef4444"; // Error red
      bodyText = "Lamentablemente, no pudimos validar tu pago o el comprobante es incorrecto, por lo que tu orden ha sido <strong>Rechazada</strong>. Por favor, contáctanos vía WhatsApp para resolver este inconveniente y recuperar tus números si aún están disponibles.";
    }

    const { data, error } = await resend.emails.send({
      from: "AutoSorteos506 <sorteos@puracode.xyz>", // Dominio verificado en Resend
      reply_to: "info@autosorteos506.com",
      to: [to],
      subject,
      text: `Hola ${name},\n\nEl total de tu orden #${orderId} es de ₡${total.toLocaleString("es-CR")}.\n\nEstado: ${statusText}\n\n${bodyText.replace(/<[^>]+>/g, '')}\n\nTus números: ${numbers.join(", ")}\n\nVerificar estado: https://autosorteos506.com/seguimiento\n\nAutoSorteos506`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
          <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #111, #222);">
            <img src="https://autosorteos506.com/autosorteos506.png" alt="AutoSorteos506" style="height: 60px; width: auto; margin-bottom: 15px;" />
            <h1 style="color: ${color}; margin: 0; font-size: 24px;">AutoSorteos506</h1>
            <p style="color: #888; margin-top: 5px; font-size: 14px;">Orden #${orderId} - <span style="color: ${color}">${statusText}</span></p>
          </div>
          <div style="padding: 30px;">
            <h2 style="margin-top: 0;">¡Hola ${name}!</h2>
            <p style="color: #ccc; line-height: 1.6;">El total de tu orden es de <strong style="color: #d4af37;">₡${total.toLocaleString("es-CR")}</strong>.</p>
            
            <p style="color: #ccc; line-height: 1.6;">${bodyText}</p>
            
            <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${color};">
              <p style="margin: 0 0 10px 0; color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tus números elegidos</p>
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #fff;">
                ${numbers.join(", ")}
              </div>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://autosorteos506.com/seguimiento" style="background-color: ${color}; color: ${status === 'confirmado' ? '#000' : '#fff'}; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verificar estado de mi compra</a>
            </div>
            
            <p style="color: #ccc; margin-bottom: 0;">¡Mucha suerte en el sorteo!</p>
          </div>
          <div style="background-color: #111; padding: 20px; text-align: center; border-top: 1px solid #333;">
            <p style="font-size: 12px; color: #666; margin: 0;">© 2026 AutoSorteos506 S.A. Todos los derechos reservados.</p>
            <p style="font-size: 11px; color: #444; margin-top: 5px;">Por favor, no respondas a este correo generado automáticamente.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error enviando correo con Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Excepción enviando correo:", error);
    return { success: false, error };
  }
}
