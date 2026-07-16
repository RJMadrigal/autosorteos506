import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Hero } from "@/components/site/Hero";
import { ActiveRaffles } from "@/components/site/ActiveRaffles";
import { HowItWorks } from "@/components/site/HowItWorks";
import { WinnersWall } from "@/components/site/WinnersWall";
import { Transparency } from "@/components/site/Transparency";
import { Faq } from "@/components/site/Faq";
import { CtaFooter } from "@/components/site/CtaFooter";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { getRaffleStats } from "@/lib/api/raffle.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoSorteos506 — Sorteos de vehículos transparentes" },
      { name: "description", content: "Participá por un Mercedes CLA45 AMG y un Mini Cooper S por solo ₡4.000 el número. Sorteo oficial y transparente en Costa Rica." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [soldCount, setSoldCount] = useState<number>(0);

  useEffect(() => {
    getRaffleStats()
      .then((stats) => setSoldCount(stats.soldCount))
      .catch((err) => console.error("Error loading stats:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero soldCount={soldCount} />
      {/* 
      <ActiveRaffles />
      <HowItWorks />
      <WinnersWall />
      <Transparency />
      <Faq />
      <CtaFooter />
      */}
      <Footer />
    </div>
  );
}
