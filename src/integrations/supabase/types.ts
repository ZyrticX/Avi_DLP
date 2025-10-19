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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      connected_services: {
        Row: {
          access_token: string
          connected_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          metadata: Json | null
          provider: Database["public"]["Enums"]["streaming_provider"]
          refresh_token: string | null
          token_expires_at: string | null
          user_display_name: string | null
          user_email: string | null
        }
        Insert: {
          access_token: string
          connected_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          provider: Database["public"]["Enums"]["streaming_provider"]
          refresh_token?: string | null
          token_expires_at?: string | null
          user_display_name?: string | null
          user_email?: string | null
        }
        Update: {
          access_token?: string
          connected_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["streaming_provider"]
          refresh_token?: string | null
          token_expires_at?: string | null
          user_display_name?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      imported_playlists: {
        Row: {
          cover_image_url: string | null
          description: string | null
          external_id: string
          id: string
          imported_at: string | null
          is_synced: boolean | null
          last_updated_at: string | null
          metadata: Json | null
          name: string
          service_id: string | null
          track_count: number | null
        }
        Insert: {
          cover_image_url?: string | null
          description?: string | null
          external_id: string
          id?: string
          imported_at?: string | null
          is_synced?: boolean | null
          last_updated_at?: string | null
          metadata?: Json | null
          name: string
          service_id?: string | null
          track_count?: number | null
        }
        Update: {
          cover_image_url?: string | null
          description?: string | null
          external_id?: string
          id?: string
          imported_at?: string | null
          is_synced?: boolean | null
          last_updated_at?: string | null
          metadata?: Json | null
          name?: string
          service_id?: string | null
          track_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_playlists_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "connected_services"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_tracks: {
        Row: {
          album: string | null
          artist: string
          cover_image_url: string | null
          download_status: string | null
          downloaded_at: string | null
          duration_seconds: number | null
          external_id: string
          file_path: string | null
          id: string
          imported_at: string | null
          metadata: Json | null
          playlist_id: string | null
          title: string
          youtube_search_query: string | null
          youtube_video_id: string | null
        }
        Insert: {
          album?: string | null
          artist: string
          cover_image_url?: string | null
          download_status?: string | null
          downloaded_at?: string | null
          duration_seconds?: number | null
          external_id: string
          file_path?: string | null
          id?: string
          imported_at?: string | null
          metadata?: Json | null
          playlist_id?: string | null
          title: string
          youtube_search_query?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          album?: string | null
          artist?: string
          cover_image_url?: string | null
          download_status?: string | null
          downloaded_at?: string | null
          duration_seconds?: number | null
          external_id?: string
          file_path?: string | null
          id?: string
          imported_at?: string | null
          metadata?: Json | null
          playlist_id?: string | null
          title?: string
          youtube_search_query?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "imported_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          created_at: string | null
          duration: number | null
          file_id: string
          id: string
          original_language: string | null
          title: string
          year: number | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_id: string
          id?: string
          original_language?: string | null
          title: string
          year?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_id?: string
          id?: string
          original_language?: string | null
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movies_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string | null
          file_id: string
          has_auto_detected: boolean | null
          id: string
        }
        Insert: {
          created_at?: string | null
          file_id: string
          has_auto_detected?: boolean | null
          id?: string
        }
        Update: {
          created_at?: string | null
          file_id?: string
          has_auto_detected?: boolean | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          artist: string | null
          created_at: string | null
          end_time: number
          file_path: string | null
          id: string
          playlist_id: string
          sort_order: number | null
          start_time: number
          status: string | null
          title: string | null
        }
        Insert: {
          artist?: string | null
          created_at?: string | null
          end_time: number
          file_path?: string | null
          id?: string
          playlist_id: string
          sort_order?: number | null
          start_time: number
          status?: string | null
          title?: string | null
        }
        Update: {
          artist?: string | null
          created_at?: string | null
          end_time?: number
          file_path?: string | null
          id?: string
          playlist_id?: string
          sort_order?: number | null
          start_time?: number
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segments_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      subtitles: {
        Row: {
          created_at: string | null
          file_path: string
          format: string | null
          id: string
          is_translated: boolean | null
          language: string
          movie_id: string
          source_language: string | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          format?: string | null
          id?: string
          is_translated?: boolean | null
          language: string
          movie_id: string
          source_language?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          format?: string | null
          id?: string
          is_translated?: boolean | null
          language?: string
          movie_id?: string
          source_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtitles_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string | null
          expires_at: string | null
          file_path: string
          file_size: number
          id: string
          mime_type: string
          original_filename: string | null
          youtube_description: string | null
          youtube_duration: number | null
          youtube_title: string | null
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          original_filename?: string | null
          youtube_description?: string | null
          youtube_duration?: number | null
          youtube_title?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          original_filename?: string | null
          youtube_description?: string | null
          youtube_duration?: number | null
          youtube_title?: string | null
          youtube_video_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      streaming_provider:
        | "spotify"
        | "apple_music"
        | "soundcloud"
        | "youtube_music"
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
      streaming_provider: [
        "spotify",
        "apple_music",
        "soundcloud",
        "youtube_music",
      ],
    },
  },
} as const
