"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { key: "blue", label: "Blue", swatch: "#2563EB" },
  { key: "purple", label: "Purple", swatch: "#7C3AED" },
  { key: "green", label: "Green", swatch: "#16A34A" },
  { key: "rose", label: "Rose", swatch: "#E11D48" },
  { key: "amber", label: "Amber", swatch: "#F59E0B" },
  { key: "slate", label: "Slate", swatch: "#475569" },
] as const;

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  biography: string;
  darkMode: boolean;
  themeColor: (typeof THEME_OPTIONS)[number]["key"];
  notificationsOptIn: boolean;
};

export function ProfileForm({ defaultValues }: { defaultValues: ProfileFormValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm<ProfileFormValues>({ defaultValues });
  const themeColor = watch("themeColor");
  const darkMode = watch("darkMode");

  function previewTheme(key: string) {
    setValue("themeColor", key as ProfileFormValues["themeColor"]);
    document.documentElement.setAttribute("data-theme", key);
  }

  function previewDarkMode(enabled: boolean) {
    setValue("darkMode", enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("Failed to update profile");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register("firstName")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register("lastName")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biography">Biography</Label>
        <Textarea id="biography" rows={3} {...register("biography")} />
      </div>

      <div className="space-y-2">
        <Label>Theme Color</Label>
        <div className="flex flex-wrap gap-3">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => previewTheme(option.key)}
              title={option.label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105",
                themeColor === option.key ? "border-foreground" : "border-transparent"
              )}
              style={{ backgroundColor: option.swatch }}
            >
              {themeColor === option.key && <Check className="h-4 w-4 text-white" />}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Changes preview instantly. Click Save to keep them.</p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="rounded border-input"
          checked={darkMode}
          onChange={(e) => previewDarkMode(e.target.checked)}
        />
        Dark mode
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="rounded border-input" {...register("notificationsOptIn")} />
        Email me about new lessons and deadlines
      </label>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
