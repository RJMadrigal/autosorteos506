import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Ticket, Trophy, Flame, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { CARS, RAFFLE, type Car } from "@/data/raffles";

export function Hero({ soldCount }: { soldCount?: number }) {
  const sold = soldCount ?? 0;
  const pct = RAFFLE.total > 0 ? Math.round((sold / RAFFLE.total) * 100) : 0;

  return (
    <section className="relative overflow-hidden bg-hero pt-28 pb-16 md:pt-36 md:pb-20">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Top status */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 glass-strong rounded-full px-3 py-1.5 text-xs">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success">
              <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
            </span>
            <span className="font-medium">Sorteo activo</span>
            <span className="text-muted-foreground">· San José, Costa Rica</span>
          </div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs text-muted-foreground">
            <Flame size={12} className="text-primary" />
            <span>10.000 números · 2 autos en juego</span>
          </div>
        </div>

        {/* Title */}
        <div className="max-w-3xl mb-8 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            Un solo número.<br />
            <span className="text-gold">Dos autos</span> esperándote.
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
            <strong className="text-foreground">10.000 números en total</strong>, dos premios reales:
            ganás el <strong className="text-foreground">Mercedes</strong> con el 1er y 2do premio de la Lotería Nacional de CR,
            o el <strong className="text-foreground">Mini Cooper</strong> con sus inversos. Sin trampas, transparente y auditable.
          </p>
        </div>

        {/* Countdown banner */}
        <div className="glass-strong rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center">
              <Trophy size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Cierre del sorteo</p>
              <p className="font-semibold text-sm">Domingo 23 de agosto de 2026 · Lotería Nacional</p>
            </div>
          </div>
          <CountdownTimer />
        </div>

        {/* Progress + CTA */}
        <div className="glass-strong rounded-2xl p-5 md:p-6 mb-8 animate-fade-up">
          <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Boletos vendidos</p>
                  <p className="font-display text-2xl font-bold tabular-nums">
                    {sold.toLocaleString("es-CR")}
                    <span className="text-muted-foreground text-sm font-medium"> / {RAFFLE.total.toLocaleString("es-CR")}</span>
                  </p>
                </div>
                <span className="text-base font-semibold text-primary tabular-nums">{pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full relative"
                  style={{ width: `${pct}%`, background: "var(--gradient-brand)" }}
                >
                  <div className="absolute inset-0 animate-shimmer rounded-full" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2.5">
                Precio del boleto: <strong className="text-foreground">₡{RAFFLE.ticketPrice.toLocaleString("es-CR")}</strong> · participás por los <strong className="text-foreground">dos premios</strong> con el mismo número.
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5 leading-snug">
                * Nota: Si a la fecha programada no se ha vendido más del 80% de los boletos, la fecha del sorteo se correrá al siguiente sorteo de la Lotería Nacional de Costa Rica.
              </p>
            </div>
            <Link
              to="/numeros"
              className="bg-primary text-primary-foreground font-semibold px-6 py-3.5 rounded-xl shadow-gold hover:translate-y-[-2px] transition inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Ticket size={16} /> Elegir mis números <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Two prize cards */}
        <div className="grid md:grid-cols-2 gap-5 items-stretch">
          {CARS.map((c, i) => (
            <PrizeCard key={c.id} car={c} highlight={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PrizeCard({ car, highlight }: { car: Car; highlight?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % car.gallery.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [car.gallery.length]);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? car.gallery.length - 1 : prev - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % car.gallery.length);
  };

  return (
    <article className="group relative animate-fade-up h-full">
      <div className="relative rounded-[28px] overflow-hidden ring-1 ring-border bg-card h-full flex flex-col shadow-card">
        {/* Image Slider */}
        <div className="relative aspect-[4/3] overflow-hidden shrink-0 bg-surface-2 group/slider">
          {car.gallery.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${car.brand} ${car.model} ${car.year} - Foto ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${i === currentIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
              loading={i === 0 && highlight ? "eager" : "lazy"}
              fetchPriority={i === 0 && highlight ? "high" : "auto"}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

          {/* Navegación (Flechas) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            <button onClick={prev} className="pointer-events-auto h-8 w-8 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition shadow-lg"><ChevronLeft size={16}/></button>
            <button onClick={next} className="pointer-events-auto h-8 w-8 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition shadow-lg"><ChevronRight size={16}/></button>
          </div>

          {/* Indicadores (Dots) */}
          <div className="absolute bottom-[92px] inset-x-0 flex justify-center gap-1.5 z-10">
            {car.gallery.map((_, i) => (
              <button 
                key={i}
                onClick={(e) => { e.preventDefault(); setCurrentIndex(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === currentIndex ? "bg-primary w-4" : "bg-white/50 w-1.5 hover:bg-white/80"}`}
                aria-label={`Ir a foto ${i + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-surface/90 backdrop-blur border border-white/10 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground shadow-card">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {car.prizeLabel}
            </div>
            <div className="inline-flex items-center gap-1.5 bg-surface/90 backdrop-blur border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-foreground shadow-card">
              <ShieldCheck size={12} className="text-accent" />
              Auditado
            </div>
          </div>

          {/* Title */}
          <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 text-white">
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">{car.brand}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-[1.05] mt-1">
              {car.model} <span className="text-primary-foreground/95">· {car.year}</span>
            </h2>
            <p className="text-sm opacity-90 mt-1">{car.color}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 flex flex-col flex-1">
          <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-start gap-2.5 min-h-[64px]">
            <Trophy size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/90 leading-relaxed">{car.prizeRule}.</p>
          </div>

          <ul className="flex flex-wrap gap-2 mt-5 min-h-[68px] content-start">
            {car.features.slice(0, 4).map((f) => (
              <li key={f} className="inline-flex items-center gap-1.5 text-[11px] bg-surface border border-border rounded-lg px-2.5 py-1.5">
                <CheckCircle2 size={11} className="text-success" /> {f}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Premio</p>
              <p className="font-display text-base font-bold">{car.brand} {car.model}</p>
            </div>
            <Link
              to="/numeros"
              className="text-sm font-semibold px-4 py-2.5 rounded-lg border border-border hover:bg-surface inline-flex items-center gap-1.5"
            >
              Participar <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
