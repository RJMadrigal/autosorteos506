import mini01 from "@/assets/cooper/_DSC6777.jpg.png";
import mini02 from "@/assets/cooper/_DSC6785.jpg.jpeg";
import mini03 from "@/assets/cooper/_DSC6786.jpg.jpeg";
import mini04 from "@/assets/cooper/_DSC6797.jpg.jpeg";
import mini05 from "@/assets/cooper/_DSC6798.jpg.jpeg";
import mini06 from "@/assets/cooper/_DSC6799.jpg.jpeg";

import merc01 from "@/assets/mercedez/_DSC6855.jpg.jpeg";
import merc02 from "@/assets/mercedez/_DSC6861.jpg.jpeg";
import merc03 from "@/assets/mercedez/_DSC6864.jpg.jpeg";
import merc04 from "@/assets/mercedez/_DSC6865.jpg.jpeg";
import merc05 from "@/assets/mercedez/_DSC6908.jpg.jpeg";
import merc06 from "@/assets/mercedez/_DSC6910.jpg.jpeg";

export type Prize = {
  id: string;
  title: string;
  subtitle: string;
  prizeLabel: string;
  prizeRule: string;
  features: string[];
};

export const PRIZES: Prize[] = [
  {
    id: "gran-premio",
    title: "Gran Premio Principal",
    subtitle: "Premio Sorpresa",
    prizeLabel: "1er Premio",
    prizeRule: "Gana con el 1er premio de la Lotería Nacional de Costa Rica",
    features: [
      "Premio totalmente libre de impuestos",
      "Garantía de transparencia",
      "Auditado legalmente",
    ],
  }
];

export const getPrize = (id: string | undefined): Prize =>
  PRIZES.find((p) => p.id === id) ?? PRIZES[0];

export const RAFFLE = {
  name: "Sorteo AutoSorteos506 · Lotería Nacional",
  total: 10_000,
  sold: 6_240,
  ticketPrice: 4_000,
  /** Domingo 23 de agosto de 2026 — sorteo Lotería Nacional CR. */
  drawDate: new Date("2026-08-23T19:00:00-06:00"),
  storageKey: "lwcr:selected",
} as const;
