import { Dashboard } from "@/components/dashboard/dashboard";
import { ME, mockGroups, mockMembers, mockQuickRoutes, mockRedemptions, mockTrips } from "@/lib/mock";

// TODO: sustituir los mocks por queries de Drizzle (sesión de Better Auth → grupos del usuario).
export default function Home() {
  return (
    <main>
      <Dashboard
        meId={ME}
        groups={mockGroups}
        members={mockMembers}
        quickRoutes={mockQuickRoutes}
        trips={mockTrips}
        redemptions={mockRedemptions}
      />
    </main>
  );
}
