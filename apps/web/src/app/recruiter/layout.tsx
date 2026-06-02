import { RecruiterSidebar } from "@/components/recruiter/sidebar";
import { RecruiterGuard } from "@/components/recruiter/guard";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RecruiterGuard>
      <div className="min-h-screen mesh-bg">
        <RecruiterSidebar />
        <div className="lg:pl-64">{children}</div>
      </div>
    </RecruiterGuard>
  );
}
