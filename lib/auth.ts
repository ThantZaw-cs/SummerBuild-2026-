import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabaseTypes";
import type { UserRole } from "@/lib/reports";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
};

const profileSelect = "id, full_name, email, role";

export function getDefaultProfileName(user: Pick<User, "email">, fullName?: string) {
  const trimmedName = fullName?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const emailUsername = user.email?.split("@")[0]?.trim();

  return emailUsername || "Citizen";
}

export function redirectForRole(role: UserRole) {
  return role === "agency" || role === "admin" ? "/dashboard" : "/my-reports";
}

export async function fetchUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase profile fetch failed:", error);
    throw error;
  }

  return data as Profile | null;
}

export async function ensureUserProfile(
  supabase: SupabaseClient<Database>,
  user: User,
  options: {
    fullName?: string;
    forceCitizenRole?: boolean;
  } = {}
) {
  const fullName = getDefaultProfileName(user, options.fullName);

  if (options.forceCitizenRole) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: fullName,
        email: user.email ?? null,
        role: "citizen"
      })
      .select(profileSelect)
      .single();

    if (error) {
      if (error.code === "23505") {
        const existingProfile = await fetchUserProfile(supabase, user.id);

        if (existingProfile) {
          return existingProfile as Profile;
        }
      }

      console.error("Profile insert failed during signup:", error);
      throw error;
    }

    return data as Profile;
  }

  const existingProfile = await fetchUserProfile(supabase, user.id);

  if (existingProfile) {
    return existingProfile as Profile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      email: user.email ?? null,
      role: "citizen"
    })
    .select(profileSelect)
    .single();

  if (error) {
    if (error.code === "23505") {
      const existingProfile = await fetchUserProfile(supabase, user.id);

      if (existingProfile) {
        return existingProfile as Profile;
      }
    }

    console.error("Profile insert failed after login:", error);
    throw error;
  }

  return data as Profile;
}
