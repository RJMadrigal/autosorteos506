import { CreditCard, Hash, ShieldCheck, Sparkles } from "lucide-react";

const steps = [
  { icon: Hash, title: "Elegí tu número", desc: "10.000 números disponibles del 0000 al 9999. Elegí cuántos querés." },
  { icon: CreditCard, title: "Pagá por SINPE Móvil", desc: "Transferí el monto exacto y subí la captura del comprobante." },
  { icon: ShieldCheck, title: "Validamos tu compra", desc: "En menos de 30 minutos en horario hábil recibís la confirmación por correo y WhatsApp." },
  { icon: Sparkles, title: "Sorteo en vivo", desc: "El domingo 23 de agosto de 2026 con los resultados de la Lotería Nacional de CR." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-16 md:py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-widest text-primary mb-3 font-semibold">Cómo funciona</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            De tu número de la suerte al <span className="text-gold">premio en tus manos</span>.
          </h2>
        </div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative bg-card border border-border rounded-2xl p-5 shadow-card">
              <span className="absolute -top-2 -right-2 font-display font-bold text-xs bg-primary text-primary-foreground h-7 w-7 grid place-items-center rounded-full shadow-gold">
                {i + 1}
              </span>
              <div className="h-11 w-11 rounded-xl bg-accent/10 border border-accent/20 grid place-items-center mb-4">
                <s.icon size={20} className="text-accent" />
              </div>
              <h3 className="font-display font-semibold text-base">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
