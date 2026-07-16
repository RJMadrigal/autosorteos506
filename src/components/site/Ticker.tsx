const items = [
  "🏆 Andrés M. ganó Hyundai Tucson",
  "🔥 Sorteo Toyota Land Cruiser al 72%",
  "✅ Entrega certificada · Carolina V.",
  "⚡ Tesla Model 3 cierra en 18h",
  "🛡️ 412 ganadores verificados",
  "🎯 Próximo gran premio · McLaren 720S",
  "📺 Sorteo en vivo cada viernes",
];

export function Ticker() {
  return (
    <div className="relative border-y border-white/5 bg-onyx/60 py-3 overflow-hidden">
      <div className="flex gap-12 whitespace-nowrap animate-ticker text-sm text-muted-foreground">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            {t}
            <span className="h-1 w-1 rounded-full bg-gold/60" />
          </span>
        ))}
      </div>
    </div>
  );
}
