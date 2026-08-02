import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/features/profile/profile-form";
import { ProfilePictureUploader } from "@/features/profile/profile-picture-uploader";
import { DeleteAccountDialog } from "@/features/profile/delete-account-dialog";
import { Trophy } from "lucide-react";

export default async function ProfilePage() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { studentProfile: { include: { enrollments: { include: { class: true } } } }, teacherProfile: true },
  });
  if (!dbUser) return null;

  const achievements = dbUser.studentProfile
    ? await prisma.studentAchievement.findMany({
        where: { studentId: dbUser.studentProfile.id },
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
      })
    : [];

  return (
    <>
      <Topbar title="Profile" name={user.name ?? ""} />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <ProfilePictureUploader
              currentUrl={dbUser.profilePictureUrl}
              firstName={dbUser.firstName}
              lastName={dbUser.lastName}
            />
            <div>
              <p className="text-lg font-semibold">
                {dbUser.firstName} {dbUser.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{dbUser.email}</p>
              <p className="text-xs text-muted-foreground">
                {dbUser.role === "STUDENT"
                  ? `Student ID: ${dbUser.studentProfile?.studentId}${
                      dbUser.studentProfile?.enrollments.length
                        ? ` · Enrolled in ${dbUser.studentProfile.enrollments.length} class${
                            dbUser.studentProfile.enrollments.length === 1 ? "" : "es"
                          }`
                        : " · Not enrolled in a class yet"
                    }`
                  : "Teacher"}
              </p>
            </div>
          </CardContent>
        </Card>

        {dbUser.studentProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {achievements.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-2 rounded-md border border-border p-3 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-medium">{a.achievement.name}</p>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">
                  No badges yet. Complete and get graded on lessons to earn your first one.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                biography: dbUser.biography ?? "",
                darkMode: dbUser.darkMode,
                themeColor: dbUser.themeColor as any,
                notificationsOptIn: dbUser.notificationsOptIn,
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog role={user.role} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
