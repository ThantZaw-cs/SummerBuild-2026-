import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  normalizeSupabaseReport,
  reportSelect,
  sortByPriority,
  type CivicReport,
  type DisplayStatus,
  displayToSupabaseStatus
} from "@/lib/reports";

export async function loadReportsFromSupabase() {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("reports")
      .select(reportSelect)
      .order("priority_score", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return sortByPriority((data ?? []).map(normalizeSupabaseReport));
  } catch (error) {
    throw error;
  }
}

export async function loadMyReportsFromSupabase() {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("reports")
      .select(reportSelect)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizeSupabaseReport);
  } catch (error) {
    throw error;
  }
}

export async function loadReportFromSupabase(id: string): Promise<CivicReport | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("reports")
      .select(reportSelect)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? normalizeSupabaseReport(data) : null;
  } catch (error) {
    throw error;
  }
}

export async function updateReportStatus(id: string, status: DisplayStatus) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: displayToSupabaseStatus[status] })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
