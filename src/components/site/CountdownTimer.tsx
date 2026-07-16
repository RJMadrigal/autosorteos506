import { useEffect, useState } from "react";
import { RAFFLE } from "@/data/raffles";

function getDiff(target: Date) {
  const t = target.getTime() - Date.now();
  const d = Math.max(0, Math.floor(t / 86400000));
  const h = Math.max(0, Math.floor((t / 3600000) % 24));
  const m = Math.max(0, Math.floor((t / 60000) % 60));
  const s = Math.max(0, Math.floor((t / 1000) % 60));
  return { d, h, m, s };
}

export function CountdownTimer({ targetDate }: { targetDate?: Date }) {
  const target = targetDate ?? RAFFLE.drawDate;
  const [t, setT] = useState(() => getDiff(target));
  useEffect(() => {
    const i = setInterval(() => setT(getDiff(target)), 1000);
    return () => clearInterval(i);
  }, [target]);

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 min-w-[64px] text-center">
      <div className="font-display font-bold text-xl md:text-2xl text-primary tabular-nums">
        {String(v).padStart(2, "0")}
      </div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{l}</div>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Cell v={t.d} l="días" />
      <Cell v={t.h} l="hrs" />
      <Cell v={t.m} l="min" />
      <Cell v={t.s} l="seg" />
    </div>
  );
}
