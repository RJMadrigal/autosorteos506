import winner1 from "@/assets/winner-1.jpg";
import winner2 from "@/assets/winner-2.jpg";
import winner3 from "@/assets/winner-3.jpg";
import { BadgeCheck, MapPin, PlayCircle } from "lucide-react";

const winners = [
  { img: winner1, name: "Andrés M.", city: "San José", prize: "Hyundai Tucson 2024", number: "07432", date: "12 Mar 2026" },
  { img: winner2, name: "Carolina V.", city: "Heredia", prize: "Kia Sportage GT", number: "01298", date: "28 Feb 2026" },
  { img: winner3, name: "Daniel & Sofía", city: "Cartago", prize: "Yamaha MT-07", number: "04561", date: "14 Feb 2026" },
];

export function WinnersWall() {
  return (
    <section id="ganadores" className="relative py-20 md:py-28 bg-graphite/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold mb-3">Muro de ganadores</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-xl">
              Ganadores reales. <span className="text-gold">Entregas certificadas.</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Cada ganador tiene un perfil público con video de entrega, testimonio y firma notarial. Sin filtros, sin secretos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {winners.map((w) => (
            <article key={w.number} className="glass rounded-2xl overflow-hidden group">
              <div className="relative aspect-square overflow-hidden">
                <img src={w.img} alt={`Ganador ${w.name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" width={800} height={800} />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-transparent to-transparent" />
                <button className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition" aria-label="Ver video de entrega">
                  <span className="h-14 w-14 rounded-full glass-strong grid place-items-center">
                    <PlayCircle size={28} className="text-gold" />
                  </span>
                </button>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-success/15 text-success border border-success/30 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full">
                  <BadgeCheck size={12} /> Verificado
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} /> {w.city}</span>
                  <span>{w.date}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mt-2">{w.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{w.prize}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Número ganador</p>
                    <p className="font-mono font-bold text-gold text-lg">#{w.number}</p>
                  </div>
                  <button className="text-xs font-semibold text-foreground glass px-3 py-2 rounded-lg hover:bg-white/5">
                    Ver perfil
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
