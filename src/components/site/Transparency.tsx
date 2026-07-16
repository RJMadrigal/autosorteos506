import { CheckCircle2, FileCheck, ScanEye, Scale, Video } from "lucide-react";

const pillars = [
  { icon: ScanEye, title: "Centro de Transparencia", desc: "Historial completo de sorteos, ganadores, evidencias y certificaciones notariales." },
  { icon: Video, title: "Sorteos en vivo", desc: "Streaming público con auditoría en tiempo real, chat abierto y repetición disponible siempre." },
  { icon: FileCheck, title: "Certificación notarial", desc: "Cada resultado firmado por notario público y verificable con código único." },
  { icon: Scale, title: "Probabilidades visibles", desc: "Números vendidos, disponibles y tu probabilidad exacta — actualizados al instante." },
];

export function Transparency() {
  return (
    <section id="transparencia" className="relative py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Transparencia total</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Construido sobre <span className="text-gold">confianza verificable</span>.
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            No vendemos números. Vendemos certeza. Cada sorteo, ganador y entrega queda registrado de forma pública e inmutable.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div key={p.title} className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition">
              <div className="h-11 w-11 rounded-xl bg-gold/10 grid place-items-center mb-4 border border-gold/30">
                <p.icon size={20} className="text-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 glass-strong rounded-3xl p-6 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-success">
              <CheckCircle2 size={14} /> Última auditoría · hace 3 minutos
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mt-3">Verifica cualquier sorteo</h3>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Ingresa el código del sorteo y consulta la firma notarial, el método de selección y el registro de auditoría.
            </p>
          </div>
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="AS-2026-00128"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <button className="bg-gold text-onyx font-semibold px-5 py-3 rounded-xl shadow-gold hover:translate-y-[-1px] transition">
              Verificar resultado
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
