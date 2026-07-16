import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";
import { ArrowRight, Users } from "lucide-react";

const raffles = [
  { img: car1, title: "Toyota Land Cruiser 2024", value: "₡78.500.000", progress: 72, tickets: 7200, total: 10000, price: "₡5.000", tag: "Más vendido" },
  { img: car2, title: "Chevrolet Camaro SS", value: "₡42.000.000", progress: 48, tickets: 4800, total: 10000, price: "₡3.500", tag: "Nuevo" },
  { img: car3, title: "Tesla Model 3 Performance", value: "₡36.800.000", progress: 91, tickets: 9100, total: 10000, price: "₡4.000", tag: "Por cerrar" },
];

export function ActiveRaffles() {
  return (
    <section id="sorteos" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold mb-3">Sorteos activos</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
              Elige tu próximo <span className="text-gold">premio</span>.
            </h2>
          </div>
          <a href="#" className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
            Ver todos <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((r) => (
            <article key={r.title} className="group glass rounded-2xl overflow-hidden hover:ring-gold transition-all">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={r.img} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" width={1024} height={768} />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-onyx/20 to-transparent" />
                <span className="absolute top-3 left-3 glass-strong text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {r.tag}
                </span>
                <span className="absolute top-3 right-3 bg-gold text-onyx text-xs font-bold px-2.5 py-1 rounded-full">
                  {r.price} / número
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-display text-xl font-semibold">{r.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Valor comercial · {r.value}</p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="inline-flex items-center gap-1"><Users size={12} /> {r.tickets.toLocaleString("es-CR")} / {r.total.toLocaleString("es-CR")} números</span>
                    <span className="font-semibold text-gold">{r.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${r.progress}%` }} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Probabilidad: </span>
                    <span className="font-semibold text-foreground">1 en {r.total.toLocaleString("es-CR")}</span>
                  </div>
                  <button className="text-sm font-semibold text-onyx bg-gold px-4 py-2 rounded-lg shadow-gold hover:translate-y-[-1px] transition">
                    Participar
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
