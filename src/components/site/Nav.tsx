import { Link } from "@tanstack/react-router";
import { Menu, X, Ticket } from "lucide-react";
import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4">
        <div className="glass-strong rounded-2xl flex items-center justify-between px-4 md:px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="text-2xl font-black tracking-tighter">LOGO</div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <Link to="/numeros" className="hover:text-foreground transition-colors">Elegir números</Link>
            <Link to="/seguimiento" className="hover:text-foreground transition-colors">Verificar mi compra</Link>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/numeros" className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg shadow-gold hover:opacity-90 transition inline-flex items-center gap-2">
              <Ticket size={14} /> Participar
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-foreground p-2"
            aria-label="Menú"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden glass-strong mt-2 rounded-2xl p-4 flex flex-col gap-3 animate-fade-up">
            <Link to="/" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-1.5">Inicio</Link>
            <Link to="/numeros" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-1.5">Elegir números</Link>
            <Link to="/seguimiento" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-1.5">Verificar mi compra</Link>
            <div className="border-t border-border pt-3">
              <Link to="/numeros" onClick={() => setOpen(false)} className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg text-center block">
                Participar ahora
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
