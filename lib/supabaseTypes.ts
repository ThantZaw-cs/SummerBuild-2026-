export type Database = {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string;
          user_id: string;
          short_description: string;
          location_text: string;
          latitude: number | null;
          longitude: number | null;
          media_url: string | null;
          media_type: Database["public"]["Enums"]["report_media_type"] | null;
          issue_type: string | null;
          severity: Database["public"]["Enums"]["report_severity"];
          authenticity_score: number;
          ai_summary: string | null;
          recommended_action: string | null;
          priority_score: number;
          duplicate_count: number;
          status: Database["public"]["Enums"]["report_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          short_description: string;
          location_text: string;
          latitude?: number | null;
          longitude?: number | null;
          media_url?: string | null;
          media_type?: Database["public"]["Enums"]["report_media_type"] | null;
          issue_type?: string | null;
          severity?: Database["public"]["Enums"]["report_severity"];
          authenticity_score?: number;
          ai_summary?: string | null;
          recommended_action?: string | null;
          priority_score?: number;
          duplicate_count?: number;
          status?: Database["public"]["Enums"]["report_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: Database["public"]["Enums"]["report_status"];
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "citizen" | "admin" | "agency";
      report_severity: "Low" | "Medium" | "High" | "Critical";
      report_status:
        | "submitted"
        | "under_review"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "rejected";
      report_media_type: "image" | "video";
    };
    CompositeTypes: Record<string, never>;
  };
};
