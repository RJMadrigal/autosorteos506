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

/**
 * UN solo sorteo, 10.000 números, DOS autos como premios.
 *  - 1er premio (Mercedes) — gana con el 1er y 2do premio de la Lotería Nacional de CR.
 *  - 2do premio (Mini)     — gana con los inversos del 1er y 2do premio.
 * Fecha del sorteo: domingo 23 de agosto de 2026.
 */

export type Car = {
  id: "mercedes" | "mini";
  brand: string;
  model: string;
  year: number;
  color: string;
  colorHex: string;
  prizeLabel: string;
  prizeRule: string;
  cover: string;
  gallery: string[];
  features: string[];
  accent: string;
};

export const CARS: Car[] = [
  {
    id: "mercedes",
    brand: "Mercedes-Benz",
    model: "CLA45 AMG",
    year: 2016,
    color: "Negro Obsidiana",
    colorHex: "#0a0a0a",
    prizeLabel: "1er Premio",
    prizeRule:
      "Gana con el 1er y 2do premio de la Lotería Nacional de Costa Rica",
    cover: merc01,
    gallery: [merc01, merc02, merc03, merc04, merc05, merc06],
    features: [
      "Motor 2.0 Turbo AMG Handcrafted · 355 HP",
      "Transmisión AMG SPEEDSHIFT DCT 7 vel.",
      "Tracción integral 4MATIC",
      "0-100 km/h en ~4.6 s",
      "Sunroof panorámico",
      "Frenos AMG con cálipers rojos",
      "Asientos deportivos AMG",
      'Aros 19" BBS · Kit ALFA · Fibra de carbono',
      "94 000 km · Full extras · Papeles al día",
    ],
    accent: "from-[#1a1a1a] via-[#404040] to-[#a8a8a8]",
  },
  {
    id: "mini",
    brand: "Mini",
    model: "Cooper",
    year: 2008,
    color: "Azul",
    colorHex: "#1d4ed8",
    prizeLabel: "2do Premio",
    prizeRule:
      "Gana con los inversos del 1er y 2do premio de la Lotería Nacional",
    cover: mini01,
    gallery: [mini01, mini02, mini03, mini04, mini05, mini06],
    features: [
      "Intake K&N · Mufla Invidia",
      "Turbo a 15 psi",
      "Transmisión manual · Reloj de boost",
      "Interior todo en cuero",
    ],
    accent: "from-[#c0271d] via-[#e0382a] to-[#ff6b5a]",
  },
];

export const getCar = (id: string | undefined): Car =>
  CARS.find((c) => c.id === id) ?? CARS[0];

export const RAFFLE = {
  name: "Sorteo AutoSorteos506 · Lotería Nacional",
  total: 10_000,
  sold: 6_240,
  ticketPrice: 4_000,
  /** Domingo 23 de agosto de 2026 — sorteo Lotería Nacional CR. */
  drawDate: new Date("2026-08-23T19:00:00-06:00"),
  storageKey: "lwcr:selected",
} as const;
