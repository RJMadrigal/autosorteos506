import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Search, Ticket, ArrowRight, X, Shuffle, Trophy, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PRIZES, RAFFLE } from "@/data/raffles";
import { toast } from "sonner";
import { getSoldNumbers } from "@/lib/api/raffle.functions";
import { CountdownTimer } from "@/components/site/CountdownTimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoSorteos506 — Elegí tu número" },
      { name: "description", content: "Participá por el gran premio eligiendo tu número." },
    ],
  }),
  component: HomePage,
});

function pad(n: number) { return n.toString().padStart(4, "0"); }

function HomePage() {
  const navigate = useNavigate();
  const TOTAL = RAFFLE.total;
  const TICKET_PRICE = RAFFLE.ticketPrice;
  const prize = PRIZES[0];

  const [soldSet, setSoldSet] = useState<Set<number>>(new Set());
  const [loadingSold, setLoadingSold] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RAFFLE.storageKey);
      if (raw) setSelected(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(RAFFLE.storageKey, JSON.stringify([...selected]));
  }, [selected]);

  const fetchSold = useCallback(async (showToast = false) => {
    setLoadingSold(true);
    try {
      const result = await getSoldNumbers();
      setSoldSet(new Set(result.sold));
      if (showToast) toast.success(`Datos actualizados · ${result.sold.length} números vendidos`);
    } catch (e) {
      console.error("Error cargando números vendidos:", e);
      if (showToast) toast.error("No se pudo conectar con el servidor");
    } finally {
      setLoadingSold(false);
    }
  }, []);

  useEffect(() => {
    fetchSold();
    const interval = setInterval(() => fetchSold(), 60_000);
    return () => clearInterval(interval);
  }, [fetchSold]);

  const toggle = (n: number) => {
    if (soldSet.has(n)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const numbers = useMemo(() => {
    if (search.trim()) {
      const q = search.trim();
      const matches: number[] = [];
      for (let i = 0; i < TOTAL; i++) {
        if (pad(i).includes(q)) matches.push(i);
      }
      return matches;
    }
    return Array.from({ length: TOTAL }, (_, i) => i);
  }, [search, TOTAL]);

  const randomPick = () => {
    let n = Math.floor(Math.random() * TOTAL);
    let tries = 0;
    while ((soldSet.has(n) || selected.has(n)) && tries < 200) {
      n = Math.floor(Math.random() * TOTAL);
      tries++;
    }
    if (!soldSet.has(n)) toggle(n);
  };

  const total = selected.size * TICKET_PRICE;
  const soldCount = soldSet.size;
  const availableCount = TOTAL - soldCount;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="pt-28 pb-40">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          
          {/* Generic Prize Section & Countdown */}
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {/* Prize Card */}
            <article className="relative rounded-[28px] overflow-hidden ring-1 ring-border bg-card shadow-card p-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground shadow-sm mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {prize.prizeLabel}
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold leading-[1.05] mt-1">
                  {prize.title}
                </h2>
                <p className="text-muted-foreground mt-2">{prize.subtitle}</p>
                
                <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-start gap-2.5 mt-6">
                  <Trophy size={16} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/90 leading-relaxed">{prize.prizeRule}</p>
                </div>

                <ul className="flex flex-col gap-2 mt-5">
                  {prize.features.map((f) => (
                    <li key={f} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={14} className="text-success" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* Countdown & Stats */}
            <div className="flex flex-col gap-5">
              <div className="glass-strong rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center">
                    <Trophy size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Cierre del sorteo</p>
                    <p className="font-semibold text-sm">Domingo 23 de agosto de 2026</p>
                  </div>
                </div>
                <CountdownTimer />
              </div>

              <div className="glass-strong rounded-2xl p-5 md:p-6 shadow-card">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Estado actual</p>
                {loadingSold ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={24} className="animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col">
                      <span className="font-display font-bold text-2xl tabular-nums text-foreground">{soldCount.toLocaleString("es-CR")}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Vendidos</span>
                    </div>
                    <div className="flex flex-col border-x border-border">
                      <span className="font-display font-bold text-2xl tabular-nums text-primary">{availableCount.toLocaleString("es-CR")}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Disponibles</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display font-bold text-2xl tabular-nums text-muted-foreground">{TOTAL.toLocaleString("es-CR")}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</span>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <p className="text-sm text-center text-muted-foreground">
                    Valor del boleto: <strong className="text-foreground">₡{TICKET_PRICE.toLocaleString("es-CR")}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border my-8" />

          {/* Numbers Selection */}
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold">
              Elegí tu número de la <span className="text-gold">suerte</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Podés elegir los números que querás. Todos los {TOTAL.toLocaleString("es-CR")} números están aquí.
            </p>
          </div>

          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-4 md:p-5 flex flex-wrap gap-3 items-center mb-6 shadow-card">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Buscar número (ej. 1234)"
                inputMode="numeric"
                className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={randomPick}
              disabled={loadingSold}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-border hover:bg-surface disabled:opacity-40"
            >
              <Shuffle size={14} /> Al azar
            </button>
            <button
              onClick={() => fetchSold(true)}
              disabled={loadingSold}
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-lg border border-border hover:bg-surface disabled:opacity-40 transition"
            >
              <RefreshCw size={14} className={loadingSold ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-surface border border-border" /> Disponible</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-primary" /> Seleccionado</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-surface-2" /> Vendido</span>
          </div>

          {/* Grid */}
          {!loadingSold && (
            <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(58px, 1fr))" }}>
              {numbers.map((n) => {
                const sold = soldSet.has(n);
                const sel = selected.has(n);
                return (
                  <button
                    key={n}
                    onClick={() => toggle(n)}
                    disabled={sold}
                    className={[
                      "font-mono text-[13px] py-2 rounded-md transition tabular-nums border",
                      sold && "bg-surface-2 text-muted-foreground/40 line-through cursor-not-allowed border-transparent",
                      !sold && !sel && "bg-surface hover:bg-surface-2 text-foreground border-border",
                      sel && "bg-primary text-primary-foreground font-semibold border-primary shadow-gold",
                    ].filter(Boolean).join(" ")}
                  >
                    {pad(n)}
                  </button>
                );
              })}
            </div>
          )}
          {!loadingSold && numbers.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Sin resultados para "{search}"</p>
          )}
        </div>
      </main>

      {/* Sticky cart */}
      {selected.size > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-4">
          <div className="mx-auto max-w-3xl bg-card border border-border rounded-2xl p-4 shadow-elevated flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[160px]">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Mis números</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-16 overflow-y-auto">
                {[...selected].slice(0, 14).map((n) => (
                  <span key={n} className="inline-flex items-center gap-1 font-mono text-xs bg-surface-2 rounded px-1.5 py-0.5">
                    {pad(n)}
                    <button onClick={() => toggle(n)} aria-label="quitar"><X size={10} /></button>
                  </span>
                ))}
                {selected.size > 14 && (
                  <span className="text-xs text-muted-foreground">+{selected.size - 14} más</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{selected.size} × ₡{TICKET_PRICE.toLocaleString("es-CR")}</p>
              <p className="font-display text-xl font-bold tabular-nums">₡{total.toLocaleString("es-CR")}</p>
            </div>
            <button
              onClick={() => navigate({ to: "/pago" })}
              className="bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-xl shadow-gold inline-flex items-center gap-2"
            >
              <Ticket size={16} /> Continuar <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
