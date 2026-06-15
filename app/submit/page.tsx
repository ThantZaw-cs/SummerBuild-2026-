import { AuthGate } from "@/components/AuthGate";
import { ReportForm } from "@/components/ReportForm";

export default function SubmitPage() {
  return (
    <AuthGate allowedRoles={["citizen", "agency", "admin"]}>
      <ReportForm />
    </AuthGate>
  );
}
