export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          submitted_by_name: string | null;
          title: string | null;
          short_description: string;
          description: string | null;
          category: string | null;
          issue_type: string;
          location_text: string;
          latitude: number | null;
          longitude: number | null;
          severity: Database["public"]["Enums"]["report_severity"];
          status: Database["public"]["Enums"]["report_status"];
          authenticity_score: number;
          duplicate_count: number;
          congestion_impact: string;
          priority_score: number;
          recommended_action: string;
          ai_summary: string;
          media_url: string | null;
          media_type: Database["public"]["Enums"]["report_media_type"] | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          submitted_by_name?: string | null;
          title?: string | null;
          short_description: string;
          description?: string | null;
          category?: string | null;
          issue_type?: string;
          location_text: string;
          latitude?: number | null;
          longitude?: number | null;
          severity?: Database["public"]["Enums"]["report_severity"];
          status?: Database["public"]["Enums"]["report_status"];
          authenticity_score?: number;
          duplicate_count?: number;
          congestion_impact?: string;
          priority_score?: number;
          recommended_action?: string;
          ai_summary?: string;
          media_url?: string | null;
          media_type?: Database["public"]["Enums"]["report_media_type"] | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          description?: string | null;
          short_description?: string;
          location_text?: string;
          status?: Database["public"]["Enums"]["report_status"];
          severity?: Database["public"]["Enums"]["report_severity"];
          authenticity_score?: number;
          priority_score?: number;
          recommended_action?: string;
          ai_summary?: string;
          duplicate_count?: number;
          congestion_impact?: string;
          issue_type?: string;
          category?: string | null;
          internal_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      report_activity_logs: {
        Row: {
          id: string;
          report_id: string;
          actor_id: string | null;
          action: string;
          old_status: Database["public"]["Enums"]["report_status"] | null;
          new_status: Database["public"]["Enums"]["report_status"] | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          actor_id?: string | null;
          action: string;
          old_status?: Database["public"]["Enums"]["report_status"] | null;
          new_status?: Database["public"]["Enums"]["report_status"] | null;
          note?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      report_duplicates: {
        Row: {
          id: string;
          report_id: string;
          duplicate_of_report_id: string;
          similarity_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          duplicate_of_report_id: string;
          similarity_score?: number;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_is_agency_or_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "citizen" | "agency" | "admin";
      report_severity: "low" | "medium" | "high" | "critical";
      report_status:
        | "pending_review"
        | "under_review"
        | "verified"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "rejected";
      report_media_type: "image" | "video";
    };
    CompositeTypes: Record<string, never>;
  };
};
