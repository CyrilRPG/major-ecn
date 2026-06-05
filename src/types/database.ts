export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.5' };
  public: {
    Tables: {
      cours: {
        Row: { access_type: string; created_at: string; description: string | null; id: string; matiere_id: string; order_index: number; titre: string };
        Insert: { access_type?: string; created_at?: string; description?: string | null; id?: string; matiere_id: string; order_index?: number; titre: string };
        Update: { access_type?: string; created_at?: string; description?: string | null; id?: string; matiere_id?: string; order_index?: number; titre?: string };
        Relationships: [{ foreignKeyName: 'cours_matiere_id_fkey'; columns: ['matiere_id']; isOneToOne: false; referencedRelation: 'matieres'; referencedColumns: ['id'] }];
      };
      course_progress: {
        Row: { cours_id: string; fiche_read: boolean; last_seen_at: string; user_id: string; video_watched: boolean };
        Insert: { cours_id: string; fiche_read?: boolean; last_seen_at?: string; user_id: string; video_watched?: boolean };
        Update: { cours_id?: string; fiche_read?: boolean; last_seen_at?: string; user_id?: string; video_watched?: boolean };
        Relationships: [{ foreignKeyName: 'course_progress_cours_id_fkey'; columns: ['cours_id']; isOneToOne: false; referencedRelation: 'cours'; referencedColumns: ['id'] }];
      };
      content_submissions: {
        Row: { id: string; cours_id: string; submitted_by: string | null; first_name: string; last_name: string; storage_path: string; created_at: string };
        Insert: { id?: string; cours_id: string; submitted_by?: string | null; first_name: string; last_name: string; storage_path: string; created_at?: string };
        Update: { id?: string; cours_id?: string; submitted_by?: string | null; first_name?: string; last_name?: string; storage_path?: string; created_at?: string };
        Relationships: [{ foreignKeyName: 'content_submissions_cours_id_fkey'; columns: ['cours_id']; isOneToOne: false; referencedRelation: 'cours'; referencedColumns: ['id'] }];
      };
      facultes: {
        Row: { created_at: string; id: string; nom: string; ville: string };
        Insert: { created_at?: string; id: string; nom: string; ville: string };
        Update: { created_at?: string; id?: string; nom?: string; ville?: string };
        Relationships: [];
      };
      fiches: {
        Row: { cours_id: string; created_at: string; id: string; pages: number | null; storage_path: string | null; titre: string };
        Insert: { cours_id: string; created_at?: string; id?: string; pages?: number | null; storage_path?: string | null; titre: string };
        Update: { cours_id?: string; created_at?: string; id?: string; pages?: number | null; storage_path?: string | null; titre?: string };
        Relationships: [{ foreignKeyName: 'fiches_cours_id_fkey'; columns: ['cours_id']; isOneToOne: false; referencedRelation: 'cours'; referencedColumns: ['id'] }];
      };
      flashcard_reviews: {
        Row: { difficulty: string; flashcard_id: string; id: string; reviewed_at: string; user_id: string; weight: number };
        Insert: { difficulty: string; flashcard_id: string; id?: string; reviewed_at?: string; user_id: string; weight: number };
        Update: { difficulty?: string; flashcard_id?: string; id?: string; reviewed_at?: string; user_id?: string; weight?: number };
        Relationships: [{ foreignKeyName: 'flashcard_reviews_flashcard_id_fkey'; columns: ['flashcard_id']; isOneToOne: false; referencedRelation: 'flashcards'; referencedColumns: ['id'] }];
      };
      flashcards: {
        Row: { cours_id: string; created_at: string; id: string; order_index: number; recto: string; verso: string };
        Insert: { cours_id: string; created_at?: string; id?: string; order_index?: number; recto: string; verso: string };
        Update: { cours_id?: string; created_at?: string; id?: string; order_index?: number; recto?: string; verso?: string };
        Relationships: [{ foreignKeyName: 'flashcards_cours_id_fkey'; columns: ['cours_id']; isOneToOne: false; referencedRelation: 'cours'; referencedColumns: ['id'] }];
      };
      matieres: {
        Row: { access_type: string; color_hex: string; created_at: string; icon_key: string; id: string; min_offer: string | null; nom: string; order_index: number; semestre_id: string };
        Insert: { access_type?: string; color_hex: string; created_at?: string; icon_key: string; id: string; min_offer?: string | null; nom: string; order_index?: number; semestre_id: string };
        Update: { access_type?: string; color_hex?: string; created_at?: string; icon_key?: string; id?: string; min_offer?: string | null; nom?: string; order_index?: number; semestre_id?: string };
        Relationships: [{ foreignKeyName: 'matieres_semestre_id_fkey'; columns: ['semestre_id']; isOneToOne: false; referencedRelation: 'semestres'; referencedColumns: ['id'] }];
      };
      profiles: {
        Row: { created_at: string; email: string | null; first_name: string | null; id: string; last_name: string | null; permission_scope: Json; phone: string | null; promotion: string | null; role: string };
        Insert: { created_at?: string; email?: string | null; first_name?: string | null; id: string; last_name?: string | null; permission_scope?: Json; phone?: string | null; promotion?: string | null; role?: string };
        Update: { created_at?: string; email?: string | null; first_name?: string | null; id?: string; last_name?: string | null; permission_scope?: Json; phone?: string | null; promotion?: string | null; role?: string };
        Relationships: [];
      };
      qcm_attempts: {
        Row: { attempted_at: string; id: string; is_correct: boolean; question_id: string; selected_items: Json; session_id: string | null; time_spent_seconds: number | null; user_id: string };
        Insert: { attempted_at?: string; id?: string; is_correct?: boolean; question_id: string; selected_items?: Json; session_id?: string | null; time_spent_seconds?: number | null; user_id: string };
        Update: { attempted_at?: string; id?: string; is_correct?: boolean; question_id?: string; selected_items?: Json; session_id?: string | null; time_spent_seconds?: number | null; user_id?: string };
        Relationships: [{ foreignKeyName: 'qcm_attempts_question_id_fkey'; columns: ['question_id']; isOneToOne: false; referencedRelation: 'qcm_questions'; referencedColumns: ['id'] }, { foreignKeyName: 'qcm_attempts_session_id_fkey'; columns: ['session_id']; isOneToOne: false; referencedRelation: 'qcm_sessions'; referencedColumns: ['id'] }];
      };
      qcm_items: {
        Row: { created_at: string; enonce: string; id: string; is_correct: boolean; justification: string; lettre: string; question_id: string; images: Json };
        Insert: { created_at?: string; enonce: string; id?: string; is_correct?: boolean; justification?: string; lettre: string; question_id: string; images?: Json };
        Update: { created_at?: string; enonce?: string; id?: string; is_correct?: boolean; justification?: string; lettre?: string; question_id?: string; images?: Json };
        Relationships: [{ foreignKeyName: 'qcm_items_question_id_fkey'; columns: ['question_id']; isOneToOne: false; referencedRelation: 'qcm_questions'; referencedColumns: ['id'] }];
      };
      qcm_questions: {
        Row: { created_at: string; enonce: string; id: string; order_index: number; serie_id: string; images: Json; correction_generale: string | null };
        Insert: { created_at?: string; enonce: string; id?: string; order_index?: number; serie_id: string; images?: Json; correction_generale?: string | null };
        Update: { created_at?: string; enonce?: string; id?: string; order_index?: number; serie_id?: string; images?: Json; correction_generale?: string | null };
        Relationships: [{ foreignKeyName: 'qcm_questions_serie_id_fkey'; columns: ['serie_id']; isOneToOne: false; referencedRelation: 'qcm_series'; referencedColumns: ['id'] }];
      };
      qcm_series: {
        Row: { annee: number | null; cours_id: string; created_at: string; duration_minutes: number | null; vignette: string | null; id: string; label: string; order_index: number; type: string };
        Insert: { annee?: number | null; cours_id: string; created_at?: string; duration_minutes?: number | null; vignette?: string | null; id?: string; label: string; order_index?: number; type: string };
        Update: { annee?: number | null; cours_id?: string; created_at?: string; duration_minutes?: number | null; vignette?: string | null; id?: string; label?: string; order_index?: number; type?: string };
        Relationships: [{ foreignKeyName: 'qcm_series_cours_id_fkey'; columns: ['cours_id']; isOneToOne: false; referencedRelation: 'cours'; referencedColumns: ['id'] }];
      };
      qcm_sessions: {
        Row: { finished_at: string | null; id: string; score_correct: number; score_total: number; serie_id: string; started_at: string; user_id: string };
        Insert: { finished_at?: string | null; id?: string; score_correct?: number; score_total?: number; serie_id: string; started_at?: string; user_id: string };
        Update: { finished_at?: string | null; id?: string; score_correct?: number; score_total?: number; serie_id?: string; started_at?: string; user_id?: string };
        Relationships: [{ foreignKeyName: 'qcm_sessions_serie_id_fkey'; columns: ['serie_id']; isOneToOne: false; referencedRelation: 'qcm_series'; referencedColumns: ['id'] }];
      };
      medgen_annales: {
        Row: { id: string; annee: number; type: string; label: string; sujet_path: string; corrige_path: string | null; ordre: number; created_at: string };
        Insert: { id?: string; annee: number; type: string; label: string; sujet_path: string; corrige_path?: string | null; ordre?: number; created_at?: string };
        Update: { id?: string; annee?: number; type?: string; label?: string; sujet_path?: string; corrige_path?: string | null; ordre?: number; created_at?: string };
        Relationships: [];
      };
      archived_qcm_series: {
        Row: { id: string; cours_id: string | null; cours_titre: string | null; label: string; type: string; annee: number | null; order_index: number | null; duration_minutes: number | null; vignette: string | null; questions: Json; archived_at: string; reason: string | null };
        Insert: { id: string; cours_id?: string | null; cours_titre?: string | null; label: string; type: string; annee?: number | null; order_index?: number | null; duration_minutes?: number | null; vignette?: string | null; questions?: Json; archived_at?: string; reason?: string | null };
        Update: { id?: string; cours_id?: string | null; cours_titre?: string | null; label?: string; type?: string; annee?: number | null; order_index?: number | null; duration_minutes?: number | null; vignette?: string | null; questions?: Json; archived_at?: string; reason?: string | null };
        Relationships: [];
      };
      satisfaction_forms: {
        Row: { active: boolean; allow_file_upload: boolean; created_at: string; created_by: string | null; fields: Json; file_upload_label: string | null; id: string; intro_text: string | null; mandatory: boolean; target_college: string | null; target_offer: string | null; target_promo: string | null; title: string };
        Insert: { active?: boolean; allow_file_upload?: boolean; created_at?: string; created_by?: string | null; fields?: Json; file_upload_label?: string | null; id?: string; intro_text?: string | null; mandatory?: boolean; target_college?: string | null; target_offer?: string | null; target_promo?: string | null; title: string };
        Update: { active?: boolean; allow_file_upload?: boolean; created_at?: string; created_by?: string | null; fields?: Json; file_upload_label?: string | null; id?: string; intro_text?: string | null; mandatory?: boolean; target_college?: string | null; target_offer?: string | null; target_promo?: string | null; title?: string };
        Relationships: [];
      };
      cours_chunks: {
        Row: { id: string; cours_id: string; source: string; source_id: string | null; chunk_index: number; content: string; token_count: number; embedding: string | null; created_at: string };
        Insert: { id?: string; cours_id: string; source: string; source_id?: string | null; chunk_index?: number; content: string; token_count?: number; embedding?: string | null; created_at?: string };
        Update: { id?: string; cours_id?: string; source?: string; source_id?: string | null; chunk_index?: number; content?: string; token_count?: number; embedding?: string | null; created_at?: string };
        Relationships: [];
      };
      qa_cache: {
        Row: { id: string; cours_id: string; question: string; question_embedding: string; answer: string; sources_count: number; model: string; hit_count: number; created_at: string };
        Insert: { id?: string; cours_id: string; question: string; question_embedding: string; answer: string; sources_count?: number; model: string; hit_count?: number; created_at?: string };
        Update: { id?: string; cours_id?: string; question?: string; question_embedding?: string; answer?: string; sources_count?: number; model?: string; hit_count?: number; created_at?: string };
        Relationships: [];
      };
      satisfaction_responses: {
        Row: { answers: Json; file_path: string | null; form_id: string; id: string; skipped: boolean; submitted_at: string; user_id: string };
        Insert: { answers?: Json; file_path?: string | null; form_id: string; id?: string; skipped?: boolean; submitted_at?: string; user_id: string };
        Update: { answers?: Json; file_path?: string | null; form_id?: string; id?: string; skipped?: boolean; submitted_at?: string; user_id?: string };
        Relationships: [{ foreignKeyName: 'satisfaction_responses_form_id_fkey'; columns: ['form_id']; isOneToOne: false; referencedRelation: 'satisfaction_forms'; referencedColumns: ['id'] }];
      };
      semestres: {
        Row: { created_at: string; faculte_id: string; id: string; label: string; numero: number };
        Insert: { created_at?: string; faculte_id: string; id: string; label: string; numero: number };
        Update: { created_at?: string; faculte_id?: string; id?: string; label?: string; numero?: number };
        Relationships: [{ foreignKeyName: 'semestres_faculte_id_fkey'; columns: ['faculte_id']; isOneToOne: false; referencedRelation: 'facultes'; referencedColumns: ['id'] }];
      };
      videos: {
        Row: { cours_id: string; created_at: string; duration_seconds: number | null; id: string; storage_path: string | null; titre: string };
        Insert: { cours_id: string; created_at?: string; duration_seconds?: number | null; id?: string; storage_path?: string | null; titre: string };
        Update: { cours_id?: string; created_at?: string; duration_seconds?: number | null; id?: string; storage_path?: string | null; titre?: string };
        Relationships: [{ foreignKeyName: 'videos_cours_id_fkey'; columns: ['cours_id']; isOneToOne: false; referencedRelation: 'cours'; referencedColumns: ['id'] }];
      };
    };
    Views: Record<string, never>;
    Functions: {
      can_access_faculte: { Args: { p_faculte_id: string }; Returns: boolean };
      current_role: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
