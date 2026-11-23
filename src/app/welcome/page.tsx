import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";

export const metadata: Metadata = {
  title: "Vuestro diario con amigos",
  description: "Recapi: registra planes y viajes, gana XP, compite en la liga mensual y salda los kilómetros en coche con créditos, sin dinero de por medio.",
};

export default function WelcomePage() {
  return <Landing />;
}
