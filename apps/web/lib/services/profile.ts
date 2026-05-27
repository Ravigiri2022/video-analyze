import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export const profileService = {
  async get(userId: string): Promise<Profile | null> {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return (data as Profile) ?? null;
  },

  async updateName(userId: string, displayName: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    const avatarUrl = `${publicUrl}?t=${Date.now()}`;
    await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    return avatarUrl;
  },
};
