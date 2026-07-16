import { Apple, Smartphone } from "lucide-react";

export function CtaFooter() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-16">
          <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-gold opacity-20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-electric opacity-20 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Lleva BetCarCR contigo.
                <br />
                <span className="text-gold">Compra, participa, gana.</span>
              </h2>
              <p className="mt-5 text-muted-foreground max-w-lg">
                Notificaciones del sorteo, compra en un toque con SINPE y seguimiento en vivo desde tu bolsillo.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a href="#" className="glass rounded-xl px-5 py-3 inline-flex items-center gap-3 hover:bg-white/5 transition">
                  <Apple size={22} />
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Descargar en</div>
                    <div className="font-display font-semibold">App Store</div>
                  </div>
                </a>
                <a href="#" className="glass rounded-xl px-5 py-3 inline-flex items-center gap-3 hover:bg-white/5 transition">
                  <Smartphone size={22} />
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Disponible en</div>
                    <div className="font-display font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[9/16] max-w-[280px] mx-auto glass-strong rounded-[2.5rem] p-3 border-2 border-white/10 shadow-elevated">
                <div className="h-full w-full rounded-[2rem] bg-onyx p-5 flex flex-col">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Hola, María</div>
                  <h4 className="font-display text-lg font-bold mt-1">Tu sorteo está por iniciar</h4>
                  <div className="mt-4 rounded-xl bg-gold p-4 text-onyx">
                    <p className="text-[10px] uppercase tracking-widest font-semibold opacity-70">Próximo sorteo</p>
                    <p className="font-display font-bold text-base mt-1">McLaren 720S</p>
                    <p className="text-xs mt-1 font-mono">02d : 14h : 23m</p>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="glass rounded-lg p-2.5 flex items-center justify-between">
                      <span>Tus números</span>
                      <span className="text-gold font-bold">12</span>
                    </div>
                    <div className="glass rounded-lg p-2.5 flex items-center justify-between">
                      <span>Nivel VIP</span>
                      <span className="text-gold font-bold">Gold</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
