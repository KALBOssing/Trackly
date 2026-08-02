import { redirect } from "next/navigation";

// The Settings tab was removed — account deletion and everything else
// that used to live here now lives on the Profile page. Redirect so an
// old bookmark or link doesn't dead-end.
export default function SettingsRedirect() {
  redirect("/profile");
}
