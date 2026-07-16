import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "¿Cómo sé que el sorteo es real?", a: "Cada sorteo se transmite en vivo, queda grabado, y el resultado se firma notarialmente con un certificado único que puedes verificar públicamente en nuestro Centro de Transparencia." },
  { q: "¿Qué métodos de pago aceptan?", a: "SINPE Móvil, tarjetas de crédito y débito, Apple Pay y Google Pay. Todos los pagos se procesan con encriptación bancaria de extremo a extremo." },
  { q: "¿Cómo recibo el premio si gano?", a: "Te contactamos en menos de 24 horas. Coordinamos la documentación, traspaso legal y entrega. Todo el proceso queda grabado en video y publicado en tu perfil de ganador." },
  { q: "¿Dónde veo mis probabilidades?", a: "En cada sorteo mostramos en tiempo real cuántos números se vendieron, cuántos quedan disponibles, y tu probabilidad exacta según tus participaciones." },
  { q: "¿Puedo participar desde otro país?", a: "Actualmente operamos en Costa Rica. Estamos preparando el lanzamiento en Panamá, Guatemala, El Salvador, Honduras, Nicaragua, México y Colombia." },
  { q: "¿Qué pasa si no se venden todos los números?", a: "Si un sorteo no alcanza el mínimo, se reembolsa el 100% automáticamente a tu método de pago original o se traslada al siguiente sorteo, a tu elección." },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Preguntas frecuentes</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Todo lo que necesitas saber.
          </h2>
        </div>

        <Accordion type="single" collapsible className="glass rounded-2xl divide-y divide-white/5">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-0 px-5 md:px-7">
              <AccordionTrigger className="py-5 text-left font-display font-medium text-base md:text-lg hover:no-underline hover:text-gold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
