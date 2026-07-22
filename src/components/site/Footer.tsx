import { Instagram, Facebook, MessageCircle, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col items-center gap-6">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/autosorteos506.png" alt="AutoSorteos506" className="h-10 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 drop-shadow-[0_0_10px_rgba(212,175,55,0.1)]" />
          </div>

          <div className="flex items-center gap-3">
            <a href="https://instagram.com/autosorteos506" target="_blank" rel="noreferrer" aria-label="Instagram" className="h-10 w-10 rounded-lg border border-border bg-card grid place-items-center hover:bg-surface-2 transition">
              <Instagram size={18} className="text-muted-foreground" />
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="h-10 w-10 rounded-lg border border-border bg-card grid place-items-center hover:bg-surface-2 transition">
              <Facebook size={16} />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-10 w-10 rounded-lg border border-border bg-card grid place-items-center hover:bg-surface-2 transition">
              <MessageCircle size={16} />
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1.5">
            <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-end gap-2">
              © 2026 AutoSorteos506 · Costa Rica 🇨🇷
              <Link to="/admin" className="opacity-0 hover:opacity-50 transition-opacity p-1">
                <Lock size={10} />
              </Link>
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
              <span>Desarrollado por</span>
              <a 
                href="https://www.puracode.xyz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-100 opacity-60 transition-opacity inline-flex items-center"
              >
                <img src="/puracode-logo.png" alt="PuraCode" className="h-4 w-auto object-contain opacity-80" />
              </a>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-white/5 pt-6 text-center">
          <p className="text-[10px] text-muted-foreground/60 max-w-3xl mx-auto leading-relaxed">
            * Nota Importante: Todos los derechos reservados © 2026 AutoSorteos506. Prohibida su reproducción sin permiso.
          </p>
        </div>
      </div>
    </footer>
  );
}
