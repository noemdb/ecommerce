import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SectionWizard } from "@/components/nosotros/wizard/SectionWizard";

export default async function AdminSectionWizardPage() {
  const session = await auth();
  if (!session || (session.user as any).role === "CUSTOMER") {
    redirect("/login");
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full">
      <SectionWizard />
    </div>
  );
}
