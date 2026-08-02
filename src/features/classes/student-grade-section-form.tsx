"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GRADE_LEVELS } from "@/lib/constants/grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type FormValues = { gradeLevel: string; section: string };

export function StudentGradeSectionForm({
  defaultValues,
}: {
  defaultValues?: { gradeLevel: string | null; section: string | null };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { gradeLevel: defaultValues?.gradeLevel ?? "", section: defaultValues?.section ?? "" },
  });

  async function onSubmit(data: FormValues) {
    if (!data.gradeLevel) {
      toast.error("Select your grade level");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profile/student-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to save");
        return;
      }
      toast.success("Grade and section saved");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Your Grade & Section</CardTitle>
        <CardDescription>
          Set these before browsing classes to join. Your teacher sees this when reviewing your request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Grade Level</Label>
            <Select onValueChange={(v) => setValue("gradeLevel", v)} value={watch("gradeLevel")}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_LEVELS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="section">Section</Label>
            <Input id="section" placeholder="e.g. STEM A" {...register("section", { required: true })} />
            {errors.section && <p className="text-xs text-destructive">Section is required</p>}
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
