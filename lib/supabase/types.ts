export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assigned_plans: {
        Row: {
          client_id: string
          created_at: string
          id: string
          name: string
          source_template_id: string | null
          starts_on: string | null
          status: Database["public"]["Enums"]["assigned_plan_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          name: string
          source_template_id?: string | null
          starts_on?: string | null
          status?: Database["public"]["Enums"]["assigned_plan_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          source_template_id?: string | null
          starts_on?: string | null
          status?: Database["public"]["Enums"]["assigned_plan_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assigned_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_plans_source_template_id_fkey"
            columns: ["source_template_id"]
            isOneToOne: false
            referencedRelation: "plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_tag_links: {
        Row: {
          exercise_id: string
          tag_id: string
        }
        Insert: {
          exercise_id: string
          tag_id: string
        }
        Update: {
          exercise_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_tag_links_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_tag_links_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "exercise_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_tags: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          trainer_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          trainer_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_tags_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          name: string
          technique_note: string | null
          trainer_id: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name: string
          technique_note?: string | null
          trainer_id: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name?: string
          technique_note?: string | null
          trainer_id?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          trainer_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          trainer_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          client_id: string
          created_at: string
          exercise_id: string | null
          exercise_name: string
          id: string
          record_type: Database["public"]["Enums"]["pr_type"]
          set_log_id: string | null
          trainer_id: string
          value: number
        }
        Insert: {
          achieved_at?: string
          client_id: string
          created_at?: string
          exercise_id?: string | null
          exercise_name: string
          id?: string
          record_type: Database["public"]["Enums"]["pr_type"]
          set_log_id?: string | null
          trainer_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          client_id?: string
          created_at?: string
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          record_type?: Database["public"]["Enums"]["pr_type"]
          set_log_id?: string | null
          trainer_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_set_log_id_fkey"
            columns: ["set_log_id"]
            isOneToOne: false
            referencedRelation: "set_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_days: {
        Row: {
          assigned_plan_id: string | null
          client_id: string | null
          created_at: string
          id: string
          name: string
          position: number
          template_id: string | null
          trainer_id: string
          updated_at: string
          week_id: string
        }
        Insert: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
          template_id?: string | null
          trainer_id: string
          updated_at?: string
          week_id: string
        }
        Update: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          template_id?: string | null
          trainer_id?: string
          updated_at?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_days_assigned_plan_id_fkey"
            columns: ["assigned_plan_id"]
            isOneToOne: false
            referencedRelation: "assigned_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_days_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_days_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_days_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "plan_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_exercises: {
        Row: {
          assigned_plan_id: string | null
          client_id: string | null
          created_at: string
          exercise_id: string
          exercise_name: string
          id: string
          position: number
          section_id: string
          superset_group: number | null
          template_id: string | null
          trainer_id: string
          trainer_note: string | null
          updated_at: string
        }
        Insert: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          exercise_id: string
          exercise_name: string
          id?: string
          position?: number
          section_id: string
          superset_group?: number | null
          template_id?: string | null
          trainer_id: string
          trainer_note?: string | null
          updated_at?: string
        }
        Update: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          exercise_id?: string
          exercise_name?: string
          id?: string
          position?: number
          section_id?: string
          superset_group?: number | null
          template_id?: string | null
          trainer_id?: string
          trainer_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_exercises_assigned_plan_id_fkey"
            columns: ["assigned_plan_id"]
            isOneToOne: false
            referencedRelation: "assigned_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_exercises_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_exercises_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "plan_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_exercises_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_sections: {
        Row: {
          assigned_plan_id: string | null
          client_id: string | null
          created_at: string
          day_id: string
          id: string
          position: number
          section_type: Database["public"]["Enums"]["plan_section_type"]
          template_id: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          day_id: string
          id?: string
          position?: number
          section_type: Database["public"]["Enums"]["plan_section_type"]
          template_id?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          day_id?: string
          id?: string
          position?: number
          section_type?: Database["public"]["Enums"]["plan_section_type"]
          template_id?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_sections_assigned_plan_id_fkey"
            columns: ["assigned_plan_id"]
            isOneToOne: false
            referencedRelation: "assigned_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sections_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sections_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_sets: {
        Row: {
          assigned_plan_id: string | null
          client_id: string | null
          created_at: string
          id: string
          plan_exercise_id: string
          position: number
          reps_max: number | null
          reps_min: number | null
          rest_seconds: number | null
          set_number: number
          target_rpe: number | null
          target_weight: number | null
          template_id: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          plan_exercise_id: string
          position?: number
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          set_number: number
          target_rpe?: number | null
          target_weight?: number | null
          template_id?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          plan_exercise_id?: string
          position?: number
          reps_max?: number | null
          reps_min?: number | null
          rest_seconds?: number | null
          set_number?: number
          target_rpe?: number | null
          target_weight?: number | null
          template_id?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_sets_assigned_plan_id_fkey"
            columns: ["assigned_plan_id"]
            isOneToOne: false
            referencedRelation: "assigned_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sets_plan_exercise_id_fkey"
            columns: ["plan_exercise_id"]
            isOneToOne: false
            referencedRelation: "plan_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sets_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_sets_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_templates: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_templates_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_weeks: {
        Row: {
          assigned_plan_id: string | null
          client_id: string | null
          created_at: string
          id: string
          notes: string | null
          position: number
          template_id: string | null
          trainer_id: string
          updated_at: string
          week_number: number
        }
        Insert: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          template_id?: string | null
          trainer_id: string
          updated_at?: string
          week_number: number
        }
        Update: {
          assigned_plan_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          template_id?: string | null
          trainer_id?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_weeks_assigned_plan_id_fkey"
            columns: ["assigned_plan_id"]
            isOneToOne: false
            referencedRelation: "assigned_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_weeks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_weeks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "plan_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_weeks_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          unit_preference: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          unit_preference?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          unit_preference?: string
          updated_at?: string
        }
        Relationships: []
      }
      set_logs: {
        Row: {
          client_id: string
          completed_at: string
          created_at: string
          exercise_id: string | null
          exercise_name: string
          id: string
          is_completed: boolean
          notes: string | null
          plan_set_id: string | null
          reps: number | null
          rpe: number | null
          trainer_id: string
          weight: number | null
          workout_session_id: string
        }
        Insert: {
          client_id: string
          completed_at?: string
          created_at?: string
          exercise_id?: string | null
          exercise_name: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          plan_set_id?: string | null
          reps?: number | null
          rpe?: number | null
          trainer_id: string
          weight?: number | null
          workout_session_id: string
        }
        Update: {
          client_id?: string
          completed_at?: string
          created_at?: string
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          plan_set_id?: string | null
          reps?: number | null
          rpe?: number | null
          trainer_id?: string
          weight?: number | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_plan_set_id_fkey"
            columns: ["plan_set_id"]
            isOneToOne: false
            referencedRelation: "plan_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_clients: {
        Row: {
          client_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["trainer_client_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["trainer_client_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["trainer_client_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_clients_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          assigned_plan_day_id: string | null
          assigned_plan_id: string
          client_id: string
          completed_at: string | null
          created_at: string
          id: string
          mood: number | null
          notes: string | null
          started_at: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          assigned_plan_day_id?: string | null
          assigned_plan_id: string
          client_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mood?: number | null
          notes?: string | null
          started_at?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          assigned_plan_day_id?: string | null
          assigned_plan_id?: string
          client_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mood?: number | null
          notes?: string | null
          started_at?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_assigned_plan_day_id_fkey"
            columns: ["assigned_plan_day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_assigned_plan_id_fkey"
            columns: ["assigned_plan_id"]
            isOneToOne: false
            referencedRelation: "assigned_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      uuid_generate_v7: { Args: never; Returns: string }
    }
    Enums: {
      assigned_plan_status: "active" | "archived"
      plan_section_type: "warmup" | "main" | "cooldown"
      pr_type: "max_weight" | "e1rm"
      trainer_client_status: "invited" | "active" | "archived"
      user_role: "trainer" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assigned_plan_status: ["active", "archived"],
      plan_section_type: ["warmup", "main", "cooldown"],
      pr_type: ["max_weight", "e1rm"],
      trainer_client_status: ["invited", "active", "archived"],
      user_role: ["trainer", "client"],
    },
  },
} as const
