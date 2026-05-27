"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { profileService } from "@/lib/services/profile";
import { compressImage } from "@/lib/image";
import type { Profile } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await profileService.get(user.id);
      if (data) setProfile(data);
    })();
  }, []);

  async function saveName(name: string) {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      await profileService.updateName(profile.id, name);
      setProfile((p) => p ? { ...p, display_name: name.trim() } : p);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file: File) {
    if (!profile) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const avatarUrl = await profileService.uploadAvatar(profile.id, compressed);
      setProfile((p) => p ? { ...p, avatar_url: avatarUrl } : p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAvatarUploading(false);
    }
  }

  return { profile, saving, saved, avatarUploading, error, saveName, uploadAvatar };
}
