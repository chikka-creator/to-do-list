export interface Todo {
  id: number;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface TodoFilters {
  status?: 'all' | 'completed' | 'pending';
  priority?: 'all' | 'low' | 'medium' | 'high';
  sort_by?: 'created_at' | 'due_date' | 'priority' | 'title';
  sort_order?: 'asc' | 'desc';
}
