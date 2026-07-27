import { Sidebar } from "@/components/dashboard/sidebar";
import { GuestProvider } from "@/components/guest-provider";
import { CommandPalette } from "@/components/dashboard/command-palette";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestProvider>
      <div className="min-h-screen mesh-bg">
        <CommandPalette />
        <Sidebar />
        <div className="lg:pl-64 pb-20 lg:pb-0">{children}</div>
      </div>
    </GuestProvider>
  );
}
