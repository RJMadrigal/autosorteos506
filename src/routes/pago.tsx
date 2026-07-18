import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { Copy, Check, Upload, ShieldCheck, ArrowLeft, Smartphone, CheckCircle2, Ticket, Trophy } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { toast } from "sonner";
import { PRIZES, RAFFLE } from "@/data/raffles";
import { processCheckout, getUploadUrl } from "@/lib/api/checkout.functions";
import { reserveNumbers, releaseReservation } from "@/lib/api/raffle.functions";

export const Route = createFileRoute("/pago")({
  head: () => ({
    meta: [
      { title: "Pago por SINPE Móvil — AutoSorteos506" },
      { name: "description", content: "Completá tu pago por SINPE Móvil y subí tu comprobante para validar tus números." },
    ],
  }),
  component: PagoPage,
});

const SINPE_NUMBER = "8888-8888";
const SINPE_NAME = "Empresa Demo S.A.";

function pad(n: number) { return n.toString().padStart(4, "0"); }

function PagoPage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<number[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", cedula: "", telefono: "", email: "", referencia: "" });
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reservation system
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const sessionIdRef = useRef<string>("");

  // Generate or retrieve a session ID
  useEffect(() => {
    let sid = sessionStorage.getItem("lwcr:session");
    if (!sid) {
      sid = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem("lwcr:session", sid);
    }
    sessionIdRef.current = sid;
  }, []);

  // Load selected numbers
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RAFFLE.storageKey);
      if (raw) setSelected(JSON.parse(raw));
    } catch {}
  }, []);

  // Create reservation when numbers are loaded
  useEffect(() => {
    if (selected.length === 0 || !sessionIdRef.current || submitted) return;

    reserveNumbers({
      data: {
        numbers: selected.map(pad),
        sessionId: sessionIdRef.current,
      },
    })
      .then((res) => {
        setExpiresAt(new Date(res.expiresAt));
      })
      .catch((err) => {
        console.error("Error reservando números:", err);
      });

    // Cleanup: release reservation when navigating away
    return () => {
      if (sessionIdRef.current && !submitted) {
        releaseReservation({ data: { sessionId: sessionIdRef.current } }).catch(() => {});
      }
    };
  }, [selected.length, submitted]);

  // Countdown timer for reservation
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        toast.error("Tu reserva de números expiró. Tenés que volver a seleccionarlos.");
        localStorage.removeItem(RAFFLE.storageKey);
        navigate({ to: "/numeros" });
      } else if (diff === 60) {
        toast.warning("¡Te queda 1 minuto para completar el pago!");
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, navigate]);

  const total = selected.length * RAFFLE.ticketPrice;

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(null), 1500);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Subí la captura del comprobante SINPE"); return; }
    if (!form.nombre || !form.telefono || !form.referencia) {
      toast.error("Completá los campos obligatorios"); return;
    }

    setIsSubmitting(true);

    try {
      const fileExt = file.name.split('.').pop() || "jpg";
      const { signedUrl, path, orderId } = await getUploadUrl({
        data: { fileExt }
      });

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        }
      });

      if (!uploadRes.ok) {
        throw new Error("Error subiendo la imagen del comprobante.");
      }

      const response = await processCheckout({
        data: {
          nombre: form.nombre,
          cedula: form.cedula,
          telefono: form.telefono,
          email: form.email,
          referencia: form.referencia,
          numbers: selected.map(pad),
          total,
          receiptPath: path,
          sessionId: sessionIdRef.current,
        },
      });

      if (response.success) {
        // Release the reservation since the order is now in DB
        if (sessionIdRef.current) {
          releaseReservation({ data: { sessionId: sessionIdRef.current } }).catch(() => {});
        }
        setSubmitted(true);
        localStorage.removeItem(RAFFLE.storageKey);
        toast.success("Pago procesado correctamente");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error de red al procesar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selected.length === 0 && !submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main className="pt-32 pb-24">
          <div className="mx-auto max-w-md px-4 text-center">
            <h1 className="font-display text-2xl font-bold">No tenés números seleccionados</h1>
            <p className="text-muted-foreground mt-2">Elegí al menos un número para continuar al pago.</p>
            <Link to="/numeros" className="inline-flex items-center gap-2 mt-6 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-xl shadow-gold">
              <Ticket size={16} /> Elegir números
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main className="pt-32 pb-24">
          <div className="mx-auto max-w-lg px-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-success/15 grid place-items-center">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h1 className="font-display text-3xl font-bold mt-6">¡Comprobante recibido!</h1>
            <p className="text-muted-foreground mt-3">
              Estamos validando tu pago. En cuanto se confirme, recibirás un correo de confirmación con tus números oficiales.
            </p>
            <div className="bg-card border border-border rounded-2xl p-4 mt-6 text-left shadow-card">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Resumen</p>
              <div className="flex justify-between mt-2"><span>Sorteo</span><span className="font-semibold">AutoSorteos506</span></div>
              <div className="flex justify-between mt-1"><span>Números</span><span className="font-mono tabular-nums">{selected.length}</span></div>
              <div className="flex justify-between mt-1"><span>Total pagado</span><span className="font-bold tabular-nums">₡{total.toLocaleString("es-CR")}</span></div>
              <div className="flex justify-between mt-1"><span>Referencia</span><span className="font-mono">{form.referencia}</span></div>
            </div>
            <Link to="/" className="inline-block mt-6 text-sm text-muted-foreground hover:text-foreground">Volver al inicio</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <button
            onClick={() => navigate({ to: "/numeros" })}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft size={14} /> Volver a elegir números
          </button>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* LEFT — Instructions + form */}
            <div className="space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Paso 1</p>
                    <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">Pagá por SINPE Móvil</h1>
                  </div>
                  {expiresAt && timeLeft > 0 && (
                    <div className="bg-warning/15 text-warning px-4 py-2 rounded-lg border border-warning/30 flex flex-col items-center justify-center min-w-[120px]">
                      <span className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Reserva expira en</span>
                      <span className="font-mono text-xl font-bold tabular-nums leading-tight mt-0.5">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">Hacé la transferencia desde tu banco al número y monto exacto.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-electric-gradient grid place-items-center">
                    <Smartphone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Datos SINPE</p>
                    <p className="font-semibold">Cualquier banco · Costa Rica</p>
                  </div>
                </div>

                <SinpeRow label="Número SINPE" value={SINPE_NUMBER} onCopy={() => copy(SINPE_NUMBER.replace("-", ""), "n")} copied={copied === "n"} mono />
                <SinpeRow label="Nombre del beneficiario" value={SINPE_NAME} onCopy={() => copy(SINPE_NAME, "name")} copied={copied === "name"} />
                <SinpeRow label="Monto exacto" value={`₡${total.toLocaleString("es-CR")}`} onCopy={() => copy(String(total), "amt")} copied={copied === "amt"} mono />
                <SinpeRow label="Detalle / Mensaje" value="Tu nombre completo" onCopy={() => copy("Tu nombre completo", "msg")} copied={copied === "msg"} />

                <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={14} className="text-accent mt-0.5 shrink-0" />
                  <p>Transferí el monto exacto. Si pagás menos o más, tu compra quedará pendiente hasta verificación manual.</p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4 shadow-card">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Paso 2</p>
                  <h2 className="font-display text-2xl font-bold mt-1">Subí tu comprobante</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Nombre completo *" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
                  <Field label="Cédula" value={form.cedula} onChange={(v) => setForm({ ...form, cedula: v })} />
                  <Field label="WhatsApp *" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} placeholder="8888-0000" />
                  <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                  <Field label="Referencia SINPE *" value={form.referencia} onChange={(v) => setForm({ ...form, referencia: v })} placeholder="Últimos 6 dígitos" className="sm:col-span-2" />
                </div>

                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Captura del comprobante *</span>
                  <div className="mt-2 border-2 border-dashed border-border hover:border-primary/50 transition rounded-xl p-6 text-center cursor-pointer bg-surface">
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <Upload size={22} className="text-primary" />
                        <span><span className="text-foreground font-medium">Tocá para subir</span> o arrastrá la imagen</span>
                        <span className="text-xs">PNG, JPG o PDF · Máx 10 MB</span>
                      </div>
                    )}
                  </div>
                </label>

                <button disabled={isSubmitting} type="submit" className="w-full bg-primary text-primary-foreground font-semibold px-5 py-3.5 rounded-xl shadow-gold hover:translate-y-[-2px] transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0">
                  {isSubmitting ? (
                    <><span className="animate-spin">⏳</span> Procesando pago...</>
                  ) : (
                    <><ShieldCheck size={16} /> Enviar comprobante</>
                  )}
                </button>
                <p className="text-[11px] text-muted-foreground text-center">Tu pago se valida en menos de 30 minutos en horario hábil.</p>
              </form>
            </div>

            {/* RIGHT — Order summary */}
            <aside className="lg:sticky lg:top-28 h-fit space-y-4">
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Premios en juego</p>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {PRIZES.map((c) => (
                      <div key={c.id} className="relative overflow-hidden rounded-xl border border-border bg-surface p-3">
                        <p className="text-[10px] uppercase tracking-widest font-semibold inline-flex items-center gap-1 text-primary"><Trophy size={10} /> {c.prizeLabel}</p>
                        <p className="font-display font-bold text-sm leading-tight mt-1">{c.title}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-5">Tu compra</p>
                  <div className="mt-2 max-h-40 overflow-y-auto flex flex-wrap gap-1.5">
                    {selected.map((n) => (
                      <span key={n} className="font-mono text-xs bg-surface-2 rounded px-2 py-1 tabular-nums">{pad(n)}</span>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
                    <Row label={`${selected.length} × ₡${RAFFLE.ticketPrice.toLocaleString("es-CR")}`} value={`₡${total.toLocaleString("es-CR")}`} />
                    <Row label="Comisión" value="₡0" muted />
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="font-semibold">Total</span>
                      <span className="font-display text-2xl font-bold text-primary tabular-nums">₡{total.toLocaleString("es-CR")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SinpeRow({ label, value, onCopy, copied, mono }: { label: string; value: string; onCopy: () => void; copied: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`mt-0.5 ${mono ? "font-mono tabular-nums" : ""} text-base font-semibold truncate`}>{value}</p>
      </div>
      <button onClick={onCopy} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface shrink-0">
        {copied ? <><Check size={12} className="text-success" /> Copiado</> : <><Copy size={12} /> Copiar</>}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", className = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1.5 w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span><span className="tabular-nums">{value}</span>
    </div>
  );
}
