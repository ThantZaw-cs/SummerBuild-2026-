import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  getMockReportById,
  normalizeSupabaseReport,
  sampleReports,
  sortReportsByPriority,
  type CivicReport,
  type DisplayStatus,
  displayToSupabaseStatus
} from "@/lib/mockReports";

const reportSelect =
  "id, user_id, short_description, location_text, latitude, longitude, media_url, media_type, issue_type, severity, authenticity_score, ai_summary, recommended_action, priority_score, duplicate_count, status, created_at, updated_at";

export async function loadReportsFromSupabase() {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("reports")
      .select(reportSelect)
      .order("priority_score", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return sampleReports;
    }

    return sortReportsByPriority(data.map(normalizeSupabaseReport));
  } catch {
    return sampleReports;
  }
}

export async function loadMyReportsFromSupabase() {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return sampleReports.slice(0, 4);
    }

    const { data, error } = await supabase
      .from("reports")
      .select(reportSelect)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return sampleReports.slice(0, 4);
    }

    return data.map(normalizeSupabaseReport);
  } catch {
    return sampleReports.slice(0, 4);
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

    if (error || !data) {
      return getMockReportById(id) ?? null;
    }

    return normalizeSupabaseReport(data);
  } catch {
    return getMockReportById(id) ?? null;
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
