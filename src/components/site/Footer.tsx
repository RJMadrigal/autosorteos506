import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col items-center gap-6">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="text-2xl font-black tracking-tighter">LOGO</div>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://instagram.com/luxurywheells.cr" target="_blank" rel="noreferrer" aria-label="Instagram" className="h-10 w-10 rounded-lg border border-border bg-card grid place-items-center hover:bg-surface-2 transition">
              <Instagram size={16} />
            </a>
            <a href="https://www.facebook.com/share/19J7vbzmr1/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Facebook" className="h-10 w-10 rounded-lg border border-border bg-card grid place-items-center hover:bg-surface-2 transition">
              <Facebook size={16} />
            </a>
            <a href="https://wa.me/50672798135" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-10 w-10 rounded-lg border border-border bg-card grid place-items-center hover:bg-surface-2 transition">
              <MessageCircle size={16} />
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1.5">
            <p className="text-xs text-muted-foreground">© 2026 AutoSorteos506 · Costa Rica 🇨🇷</p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
              <span>Desarrollado por</span>
              <a 
                href="https://www.puracode.xyz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-100 opacity-60 transition-opacity inline-flex items-center"
              >
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">LOGO</div>
              </a>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-white/5 pt-6 text-center">
          <p className="text-[10px] text-muted-foreground/60 max-w-3xl mx-auto leading-relaxed">
            * Nota Importante: La fecha del sorteo está sujeta a la venta de boletos. Si a la fecha programada no se ha vendido más del 80% de los números disponibles, la fecha del sorteo se correrá automáticamente al siguiente sorteo dominical de la Lotería Nacional de Costa Rica. Al adquirir un boleto, el participante acepta esta condición.
          </p>
        </div>
      </div>
    </footer>
  );
}
