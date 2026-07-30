import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

export default async function DashboardRedirect() {
  const user = await requireUser();
  redirect(user.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard");
}
