import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Mail, Phone, Ticket, Trophy, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { searchOrders } from "@/lib/api/raffle.functions";

type Order = {
  order_id: string;
  raffle_name: string;
  numbers: string[];
  total: number;
  nombre: string;
  telefono: string;
  email: string;
  referencia: string;
  status: "pendiente" | "confirmado" | "rechazado";
  receipt_url: string;
  created_at: string;
};

export const Route = createFileRoute("/seguimiento")({
  head: () => ({
    meta: [
      { title: "Seguimiento de mi compra — AutoSorteos506" },
      { name: "description", content: "Verificá tus números ingresando tu correo o número de teléfono." },
    ],
  }),
  component: SeguimientoPage,
});

function SeguimientoPage() {
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [results, setResults] = useState<Order[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setIsSearching(true);
    try {
      const e1 = email.trim().toLowerCase();
      const t1 = telefono.replace(/\D/g, "");
      const result = await searchOrders({ data: { email: e1, telefono: t1 } });
      setResults(result.orders);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Verificación</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">
              Verificá tu <span className="text-gold">compra</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Ingresá tu correo o tu número de teléfono para ver tus números y el estado de tu pago.
            </p>
          </div>

          <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4 shadow-card">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
                  <Mail size={12} /> Correo electrónico
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="mt-1.5 w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
                  <Phone size={12} /> Teléfono
                </span>
                <input
                  inputMode="numeric"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="8888-0000"
                  className="mt-1.5 w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Podés llenar uno o ambos campos — buscamos coincidencias por cualquiera de los dos.
            </p>
            <button
              type="submit"
              disabled={(!email && !telefono) || isSearching}
              className="w-full bg-primary text-primary-foreground font-semibold px-5 py-3.5 rounded-xl shadow-gold hover:translate-y-[-2px] transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSearching ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Buscando…
                </>
              ) : (
                <>
                  <Search size={16} /> Verificar mis números
                </>
              )}
            </button>
          </form>

          {searched && !isSearching && results !== null && (
            <div className="mt-8 space-y-4">
              {results.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-card">
                  <div className="mx-auto h-12 w-12 rounded-full bg-surface-2 grid place-items-center">
                    <AlertCircle size={22} className="text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-bold mt-4">No encontramos compras</h2>
                  <p className="text-muted-foreground text-sm mt-2">
                    Verificá que el correo o teléfono sean los mismos que usaste al pagar. Si recién hiciste el pago, puede tardar unos minutos en aparecer.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    Encontramos <span className="text-foreground font-semibold">{results.length}</span> {results.length === 1 ? "compra" : "compras"} asociadas.
                  </p>
                  {results.map((o) => (
                    <OrderCard key={o.order_id} order={o} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusMap = {
    pendiente: { icon: Clock, label: "Pendiente de validación", cls: "bg-warning/15 text-warning border-warning/30" },
    confirmado: { icon: CheckCircle2, label: "Confirmado", cls: "bg-success/15 text-success border-success/30" },
    rechazado: { icon: AlertCircle, label: "Rechazado", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  } as const;
  const s = statusMap[order.status] ?? statusMap.pendiente;
  const Icon = s.icon;
  return (
    <article className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Orden</p>
          <p className="font-mono font-semibold">{order.order_id}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${s.cls}`}>
          <Icon size={12} /> {s.label}
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
            <Trophy size={11} className="text-primary" /> Sorteo
          </p>
          <p className="font-semibold mt-1">{order.raffle_name}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Referencia SINPE</p>
          <p className="font-mono mt-1">{order.referencia}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total</p>
          <p className="font-display font-bold text-primary mt-1 tabular-nums">₡{order.total.toLocaleString("es-CR")}</p>
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5 mb-2">
          <Ticket size={11} /> Tus números ({order.numbers.length})
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {order.numbers.map((n) => (
            <span key={n} className="font-mono text-xs bg-surface-2 rounded px-2 py-1 tabular-nums">{n}</span>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4">
        Comprado el {new Date(order.created_at).toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </article>
  );
}
