import { Sidebar } from "@/components/dashboard/sidebar";
import { GuestProvider } from "@/components/guest-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestProvider>
      <div className="min-h-screen mesh-bg">
        <Sidebar />
        <div className="lg:pl-64 pb-20 lg:pb-0">{children}</div>
      </div>
    </GuestProvider>
  );
}
