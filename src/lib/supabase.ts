import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          monthly_limit: number;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          monthly_limit?: number;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          monthly_limit?: number;
          color?: string;
          created_at?: string;
        };
      };
      income: {
        Row: {
          id: string;
          description: string;
          amount: number;
          date: string;
          is_recurring: boolean;
          recurring_day: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          amount: number;
          date: string;
          is_recurring?: boolean;
          recurring_day?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          amount?: number;
          date?: string;
          is_recurring?: boolean;
          recurring_day?: number | null;
          active?: boolean;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          name: string;
          amount: number;
          due_date: string;
          is_recurring: boolean;
          recurrence_count: number;
          current_recurrence: number;
          was_paid: boolean;
          paid_at: string | null;
          category_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          amount: number;
          due_date: string;
          is_recurring?: boolean;
          recurrence_count?: number;
          current_recurrence?: number;
          was_paid?: boolean;
          paid_at?: string | null;
          category_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          amount?: number;
          due_date?: string;
          is_recurring?: boolean;
          recurrence_count?: number;
          current_recurrence?: number;
          was_paid?: boolean;
          paid_at?: string | null;
          category_id?: string | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          category_id: string;
          amount: number;
          description: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          amount: number;
          description: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          amount?: number;
          description?: string;
          date?: string;
          created_at?: string;
        };
      };
      savings_goals: {
        Row: {
          id: string;
          name: string;
          goal_amount: number;
          current_amount: number;
          deadline: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          goal_amount: number;
          current_amount?: number;
          deadline?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          goal_amount?: number;
          current_amount?: number;
          deadline?: string | null;
          created_at?: string;
        };
      };
    };
  };
};