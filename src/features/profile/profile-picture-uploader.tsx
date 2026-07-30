"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2, X } from "lucide-react";
import { initials } from "@/lib/utils";

export function ProfilePictureUploader({
  currentUrl,
  firstName,
  lastName,
}: {
  currentUrl: string | null;
  firstName: string;
  lastName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/picture", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to upload photo");
        return;
      }
      toast.success("Profile picture updated");
      router.refresh();
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removePhoto() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/picture", { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to remove photo");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
        disabled={loading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary text-xl font-semibold text-primary-foreground"
        title="Change profile picture"
        aria-label="Change profile picture"
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          initials(firstName, lastName)
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
        </span>
      </button>
      {currentUrl && !loading && (
        <button
          type="button"
          onClick={removePhoto}
          title="Remove photo"
          aria-label="Remove profile picture"
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
