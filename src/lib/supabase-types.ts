export type UserRole = 'Administrador' | 'Marketing' | 'Colaborador';
export type UserStatus = 'Activo' | 'Inactivo' | 'Suspendido';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          last_name: string;
          email: string;
          phone: string;
          company: string;
          job_title: string;
          role: UserRole;
          status: UserStatus;
          avatar_url: string;
          last_access: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          last_name?: string;
          email: string;
          phone?: string;
          company?: string;
          job_title?: string;
          role?: UserRole;
          status?: UserStatus;
          avatar_url?: string;
          last_access?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          company?: string;
          job_title?: string;
          role?: UserRole;
          status?: UserStatus;
          avatar_url?: string;
          last_access?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
    };
  };
};

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type { UserRole, UserStatus };
