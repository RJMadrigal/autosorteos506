import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Search, Ticket, ArrowRight, X, Shuffle, Trophy, RefreshCw, Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CARS, RAFFLE } from "@/data/raffles";
import { toast } from "sonner";
import { getSoldNumbers } from "@/lib/api/raffle.functions";

export const Route = createFileRoute("/numeros")({
  head: () => ({
    meta: [
      { title: "Elegí tu número — AutoSorteos506" },
      { name: "description", content: "Elegí tu número del 0000 al 9999 para participar por el Mercedes CLA45 AMG y el Mini Cooper en el sorteo del 23 de agosto de 2026." },
    ],
  }),
  component: NumerosPage,
});

function pad(n: number) { return n.toString().padStart(4, "0"); }

function NumerosPage() {
  const navigate = useNavigate();
  const TOTAL = RAFFLE.total;
  const TICKET_PRICE = RAFFLE.ticketPrice;

  // Real sold numbers from DB
  const [soldSet, setSoldSet] = useState<Set<number>>(new Set());
  const [loadingSold, setLoadingSold] = useState(true);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 500;
  const pageCount = TOTAL / perPage;

  // Load selected numbers from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RAFFLE.storageKey);
      if (raw) setSelected(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  // Persist selection to localStorage
  useEffect(() => {
    localStorage.setItem(RAFFLE.storageKey, JSON.stringify([...selected]));
  }, [selected]);

  // Fetch sold numbers from Supabase
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
    // Refresh every 60 seconds to keep sold numbers up to date
    const interval = setInterval(() => fetchSold(), 60_000);
    return () => clearInterval(interval);
  }, [fetchSold]);

  const toggle = (n: number) => {
    if (soldSet.has(n)) return;

    const isAdding = !selected.has(n);

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

    if (isAdding) {
      const numStr = pad(n);
      // Inverted: swap first 2 and last 2 digits
      const invStr = numStr.slice(2, 4) + numStr.slice(0, 2);
      const invNum = parseInt(invStr, 10);

      if (invNum !== n && !soldSet.has(invNum) && !selected.has(invNum)) {
        toast.success(`¡El número invertido ${invStr} está libre!`, {
          description: `Elegiste el ${numStr}. Si comprás también su invertido ${invStr}, podés pegar ambos premios.`,
          action: {
            label: "Agregar invertido",
            onClick: () => {
              setSelected((p) => {
                const np = new Set(p);
                np.add(invNum);
                return np;
              });
            },
          },
          duration: 8000,
        });
      }
    }
  };

  const numbers = useMemo(() => {
    if (search.trim()) {
      const q = search.trim();
      const matches: number[] = [];
      for (let i = 0; i < TOTAL && matches.length < perPage; i++) {
        if (pad(i).includes(q)) matches.push(i);
      }
      return matches;
    }
    const start = page * perPage;
    return Array.from({ length: perPage }, (_, i) => start + i);
  }, [page, search, TOTAL]);

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
          {/* Prize summary */}
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {CARS.map((c) => (
              <div key={c.id} className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="relative h-28">
                  <img src={c.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                  <div className="relative p-4 flex items-center justify-between h-full text-white">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-semibold opacity-90">{c.prizeLabel}</p>
                      <p className="font-display font-bold text-lg">{c.brand} {c.model}</p>
                      <p className="text-xs opacity-80">{c.year} · {c.color}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Header + availability counter */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sorteo único · 10.000 números</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">
              Elegí tu número de la <span className="text-gold">suerte</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Con un solo número participás por <strong className="text-foreground">los dos autos</strong>. ₡{TICKET_PRICE.toLocaleString("es-CR")} por número.
            </p>
            <div className="mt-3 inline-flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2 text-xs">
              <Trophy size={14} className="text-primary mt-0.5" />
              <span><strong>1er premio:</strong> 1er y 2do número de la Lotería Nacional · <strong>2do premio:</strong> sus inversos.</span>
            </div>

            {/* Live availability stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5 shadow-card">
                {loadingSold ? (
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Vendidos</span>
                      <span className="font-display font-bold text-lg tabular-nums text-foreground">{soldCount.toLocaleString("es-CR")}</span>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Disponibles</span>
                      <span className="font-display font-bold text-lg tabular-nums text-primary">{availableCount.toLocaleString("es-CR")}</span>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</span>
                      <span className="font-display font-bold text-lg tabular-nums text-muted-foreground">{TOTAL.toLocaleString("es-CR")}</span>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => fetchSold(true)}
                disabled={loadingSold}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border hover:bg-surface disabled:opacity-40 transition"
              >
                <RefreshCw size={12} className={loadingSold ? "animate-spin" : ""} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-4 md:p-5 flex flex-wrap gap-3 items-center mb-6 shadow-card">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value.replace(/\D/g, "").slice(0, 4)); setPage(0); }}
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
            {!search && (
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-40"
                >←</button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {pad(page * perPage)} – {pad((page + 1) * perPage - 1)}
                </span>
                <button
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-surface disabled:opacity-40"
                >→</button>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-surface border border-border" /> Disponible</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-primary" /> Seleccionado</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-surface-2" /> Vendido</span>
          </div>

          {/* Loading skeleton */}
          {loadingSold && (
            <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Cargando disponibilidad real...</span>
            </div>
          )}

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
