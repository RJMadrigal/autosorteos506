import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard, Ticket, DollarSign, Users, CheckCircle2, Clock, XCircle,
  Search, Download, ExternalLink, ShieldCheck, TrendingUp, Trophy, Lock, Loader2, Ban, LogOut
} from "lucide-react";
import { CARS, RAFFLE } from "@/data/raffles";
import { getAdminOrders, updateOrderStatus, blockNumbers, unblockNumbers, getRaffleStats, rebuildAndConfirmOrder } from "@/lib/api/raffle.functions";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · AutoSorteos506" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Status = "pendiente" | "confirmado" | "rechazado";
type DBOrder = {
  order_id: string;
  created_at: string;
  nombre: string;
  telefono: string;
  email: string;
  numbers: string[];
  total: number;
  referencia: string;
  status: Status;
  receipt_url: string;
};
type BlockedNumber = { id: string; number: string; reason: string; created_at: string };

function pad(n: string | number) { return n.toString().padStart(4, "0"); }

function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  const [txs, setTxs] = useState<DBOrder[]>([]);
  const [blockedList, setBlockedList] = useState<BlockedNumber[]>([]);
  const [stats, setStats] = useState({ soldCount: 0, revenue: 0, pendingCount: 0, confirmedCount: 0, rejectedCount: 0, totalOrders: 0, blockedCount: 0 });

  const [filter, setFilter] = useState<Status | "all">("all");
  const [query, setQuery] = useState("");
  const [numbersToBlock, setNumbersToBlock] = useState("");

  // Conflict Resolution State
  const [conflictOrder, setConflictOrder] = useState<any>(null);
  const [conflictData, setConflictData] = useState<{ takenNumbers: string[], originalNumbers: string[] } | null>(null);
  const [newNumbersInput, setNewNumbersInput] = useState("");
  const [isRebuilding, setIsRebuilding] = useState(false);

  const loadData = async (token: string) => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        getAdminOrders({ data: { token } }),
        getRaffleStats()
      ]);
      
      if ((ordersRes as any).error) throw new Error((ordersRes as any).error);
      if ((statsRes as any).error) throw new Error((statsRes as any).error);

      setTxs(ordersRes.orders as DBOrder[]);
      setBlockedList(ordersRes.blocked as BlockedNumber[]);
      setStats(statsRes as any);
      setIsLogged(true);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar datos");
      setIsLogged(false);
      setSessionToken(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (data.session) {
        setSessionToken(data.session.access_token);
        await loadData(data.session.access_token);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      toast.error(error?.message || "Credenciales inválidas");
      setLoading(false);
      return;
    }

    setSessionToken(data.session.access_token);
    await loadData(data.session.access_token);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    setSessionToken(null);
    setIsLogged(false);
  };

  const setStatus = async (id: string, status: Status) => {
    if (!sessionToken) return;
    try {
      const res = await updateOrderStatus({ data: { token: sessionToken, orderId: id, status } });
      if (res && res.conflict) {
        const o = txs.find(t => t.order_id === id);
        if (o) {
          setConflictOrder(o);
          setConflictData({ takenNumbers: res.takenNumbers || [], originalNumbers: res.originalNumbers || [] });
          setNewNumbersInput("");
        }
        return;
      }
      toast.success(`Estado actualizado a ${status}`);
      loadData(sessionToken); // Refresh
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar estado");
    }
  };

  const handleRebuildOrder = async () => {
    if (!sessionToken || !conflictOrder || !conflictData) return;
    setIsRebuilding(true);
    
    // Parse the new numbers input
    const additionalNums = newNumbersInput.split(",").map(n => pad(n.trim())).filter(n => n.length === 4);
    
    // Combine available numbers with the new ones provided
    const availableOriginals = conflictData.originalNumbers.filter(n => !conflictData.takenNumbers.includes(n));
    const finalNumbers = [...availableOriginals, ...additionalNums];
    
    // Check if lengths match (optional, but good for total price consistency)
    if (finalNumbers.length !== conflictData.originalNumbers.length) {
      toast.error(`Necesitas asignar ${conflictData.originalNumbers.length} números en total. Tienes ${finalNumbers.length}.`);
      setIsRebuilding(false);
      return;
    }

    try {
      await rebuildAndConfirmOrder({
        data: {
          token: sessionToken,
          orderId: conflictOrder.order_id,
          newNumbers: finalNumbers
        }
      });
      toast.success("Orden reconstruida y confirmada con éxito");
      setConflictOrder(null);
      setConflictData(null);
      loadData(sessionToken);
    } catch (err: any) {
      toast.error(err.message || "Error al reconstruir la orden");
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleBlock = async () => {
    if (!sessionToken || !numbersToBlock.trim()) return;
    const nums = numbersToBlock.split(",").map(n => pad(n.trim())).filter(n => n.length === 4);
    if (nums.length === 0) {
      toast.error("Formato inválido. Usa números separados por coma.");
      return;
    }
    try {
      await blockNumbers({ data: { token: sessionToken, numbers: nums } });
      toast.success("Números bloqueados");
      setNumbersToBlock("");
      loadData(sessionToken);
    } catch (err: any) {
      toast.error(err.message || "Error al bloquear");
    }
  };

  const handleUnblock = async (nums: string[]) => {
    if (!sessionToken) return;
    try {
      await unblockNumbers({ data: { token: sessionToken, numbers: nums } });
      toast.success("Números desbloqueados");
      loadData(sessionToken);
    } catch (err: any) {
      toast.error(err.message || "Error al desbloquear");
    }
  };

  const filtered = useMemo(() => {
    return txs.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!t.nombre.toLowerCase().includes(q) && !t.order_id.toLowerCase().includes(q) && !t.referencia.includes(q) && !t.telefono.includes(q)) return false;
      }
      return true;
    });
  }, [txs, filter, query]);

  if (loading && !isLogged) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-card border border-border p-8 rounded-2xl shadow-card max-w-sm w-full text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 grid place-items-center mb-4">
            <Lock className="text-primary" size={24} />
          </div>
          <h1 className="font-display text-2xl font-bold">Acceso Admin</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Ingresa tus credenciales para acceder al panel.</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
          />
          <button type="submit" disabled={loading || !password || !email} className="w-full bg-primary text-primary-foreground font-semibold px-4 py-3 rounded-lg shadow-gold hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Ingresar"}
          </button>
        </form>
      </div>
    );
  }

  const pct = Math.round((stats.soldCount / RAFFLE.total) * 100);

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="border-b border-border bg-card/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black tracking-tighter">LOGO</div>
            <div>
              <p className="font-display font-semibold leading-tight">Panel Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              <ExternalLink size={12} /> Ver sitio
            </Link>
            <button onClick={handleLogout} className="text-xs text-destructive hover:opacity-80 inline-flex items-center gap-1.5 font-semibold">
              <LogOut size={12} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-8">
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="p-5 md:p-6 grid lg:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Sorteo activo</p>
              <h2 className="font-display text-xl md:text-2xl font-bold mt-1">{RAFFLE.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Domingo 23 de agosto de 2026 · ₡{RAFFLE.ticketPrice.toLocaleString("es-CR")} por número
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{stats.soldCount.toLocaleString("es-CR")} de {RAFFLE.total.toLocaleString("es-CR")}</span>
                  <span className="tabular-nums text-primary font-semibold">{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-brand)" }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CARS.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                  <div className="relative h-20 w-32 md:w-40">
                    <img src={c.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-1.5 left-2 text-white">
                      <p className="text-[9px] uppercase tracking-widest font-semibold inline-flex items-center gap-1"><Trophy size={9} /> {c.prizeLabel}</p>
                      <p className="text-xs font-bold leading-tight">{c.brand} {c.model}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={<DollarSign size={16} />} label="Ingresos verificados" value={`₡${stats.revenue.toLocaleString("es-CR")}`} accent />
          <Kpi icon={<Ticket size={16} />} label="Números vendidos" value={`${stats.soldCount.toLocaleString("es-CR")} / ${RAFFLE.total.toLocaleString("es-CR")}`} />
          <Kpi icon={<Clock size={16} />} label="Pendientes" value={String(stats.pendingCount)} tone="warning" />
          <Kpi icon={<Users size={16} />} label="Total Órdenes" value={String(stats.totalOrders)} />
        </section>

        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-card p-5 md:p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="font-display font-semibold mb-2 flex items-center gap-2"><Ban size={16} className="text-destructive" /> Bloqueo Manual</h3>
            <p className="text-xs text-muted-foreground mb-4">Bloquea números sin asignarlos a una orden (ej: cortesías, reservados).</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Ej: 0528, 1234" value={numbersToBlock} onChange={e => setNumbersToBlock(e.target.value)} className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={handleBlock} className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">Bloquear</button>
            </div>
          </div>
          <div className="flex-1 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <h3 className="font-display text-sm font-semibold mb-3">Números bloqueados ({blockedList.length})</h3>
            <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2">
              {blockedList.length === 0 && <span className="text-xs text-muted-foreground">Ninguno</span>}
              {blockedList.map(b => (
                <div key={b.id} className="inline-flex items-center gap-1 bg-surface-2 border border-border rounded px-2 py-1 text-xs font-mono">
                  {b.number}
                  <button onClick={() => handleUnblock([b.number])} className="text-muted-foreground hover:text-destructive ml-1"><XCircle size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <header className="p-4 md:p-5 flex flex-wrap gap-3 items-center justify-between border-b border-border">
            <div>
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" /> Órdenes recientes
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Validá los pagos SINPE recibidos</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..."
                  className="bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex items-center gap-1 bg-surface rounded-lg p-1 text-xs border border-border">
                {(["all", "pendiente", "confirmado", "rechazado"] as const).map((s) => (
                  <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md transition capitalize ${filter === s ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
                    {s === "all" ? "Todos" : s}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-surface">
                <tr>
                  <Th>ID / Fecha</Th>
                  <Th>Comprador</Th>
                  <Th>Números</Th>
                  <Th className="text-right">Monto</Th>
                  <Th>Ref.</Th>
                  <Th>Comprobante</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.order_id} className="border-t border-border hover:bg-surface/60">
                    <Td>
                      <span className="font-mono text-xs">{t.order_id}</span>
                      <p className="text-muted-foreground text-[10px] whitespace-nowrap">{new Date(t.created_at).toLocaleString()}</p>
                    </Td>
                    <Td>
                      <p className="font-medium">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground">{t.telefono}</p>
                      <p className="text-xs text-muted-foreground">{t.email}</p>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {t.numbers.slice(0, 4).map((n) => (
                          <span key={n} className="font-mono text-[11px] bg-surface-2 rounded px-1.5 py-0.5">{pad(n)}</span>
                        ))}
                        {t.numbers.length > 4 && <span className="text-[11px] text-muted-foreground">+{t.numbers.length - 4}</span>}
                      </div>
                    </Td>
                    <Td className="text-right font-mono tabular-nums">₡{t.total.toLocaleString("es-CR")}</Td>
                    <Td><span className="font-mono text-xs">{t.referencia}</span></Td>
                    <Td>
                      {t.receipt_url ? (
                        <a href={t.receipt_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs inline-flex items-center gap-1">
                          <ExternalLink size={12}/> Ver foto
                        </a>
                      ) : <span className="text-xs text-muted-foreground">N/A</span>}
                    </Td>
                    <Td><StatusBadge status={t.status} /></Td>
                    <Td className="text-right">
                      <div className="inline-flex gap-1">
                        {t.status !== "confirmado" && (
                          <button onClick={() => setStatus(t.order_id, "confirmado")} className="p-1.5 rounded-md bg-success/15 text-success hover:bg-success/25" title="Aprobar">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {t.status !== "rechazado" && (
                          <button onClick={() => setStatus(t.order_id, "rechazado")} className="p-1.5 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25" title="Rechazar">
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-muted-foreground py-12">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Conflict Modal */}
      {conflictOrder && conflictData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-gold relative">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 grid place-items-center mb-4">
              <Ban className="text-destructive" size={24} />
            </div>
            <h2 className="font-display text-xl font-bold text-center mb-2">Conflicto de Números</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Esta orden fue rechazada y sus números se liberaron. Alguien más ya compró algunos de ellos.
            </p>
            
            <div className="bg-surface rounded-lg p-4 mb-4 text-sm">
              <p><strong>Números perdidos:</strong> <span className="text-destructive font-mono">{conflictData.takenNumbers.join(", ")}</span></p>
              <p className="mt-1"><strong>Números aún libres:</strong> <span className="text-success font-mono">{conflictData.originalNumbers.filter(n => !conflictData.takenNumbers.includes(n)).join(", ")}</span></p>
            </div>
            
            <p className="text-sm font-semibold mb-2">Agrega {conflictData.takenNumbers.length} número(s) para reemplazar los perdidos:</p>
            <input
              type="text"
              value={newNumbersInput}
              onChange={e => setNewNumbersInput(e.target.value)}
              placeholder="Ej: 0045, 0123"
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm mb-4 font-mono"
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConflictOrder(null)} 
                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-surface-2"
                disabled={isRebuilding}
              >
                Cancelar
              </button>
              <button 
                onClick={handleRebuildOrder} 
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-gold flex justify-center items-center gap-2"
                disabled={isRebuilding}
              >
                {isRebuilding ? <Loader2 className="animate-spin" size={16} /> : "Guardar y Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ icon, label, value, tone, accent }: { icon: React.ReactNode; label: string; value: string; tone?: "warning"; accent?: boolean }) {
  return (
    <div className={`bg-card border ${accent ? "border-primary/30 ring-1 ring-primary/20" : "border-border"} rounded-2xl p-4 shadow-card`}>
      <div className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest ${tone === "warning" ? "text-warning" : "text-muted-foreground"}`}>
        {icon} {label}
      </div>
      <p className="font-display text-2xl font-bold mt-2 tabular-nums">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "confirmado") return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-success/15 text-success">Confirmado</span>;
  if (status === "pendiente") return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-warning/15 text-warning">Pendiente</span>;
  return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-destructive/15 text-destructive">Rechazado</span>;
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left font-semibold px-4 py-3 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
