'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ClipboardList, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import TodoCard from '@/components/TodoCard';
import TodoForm, { type TodoFormData } from '@/components/TodoForm';
import TodoFiltersBar from '@/components/TodoFiltersBar';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import type { Todo, TodoStats, TodoFilters } from '@/types/todo';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, initFromCookies } = useAuthStore();
  const toast = useToast();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TodoFilters>({
    status: 'all',
    priority: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Auth guard
  useEffect(() => {
    initFromCookies();
  }, [initFromCookies]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.priority && filters.priority !== 'all') params.priority = filters.priority;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;

      const [todosRes, statsRes] = await Promise.all([
        api.get('/todos', { params }),
        api.get('/todos/stats'),
      ]);
      setTodos(Array.isArray(todosRes.data?.data) ? todosRes.data.data : []);
      setStats(statsRes.data || { total: 0, completed: 0, pending: 0, overdue: 0 });
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated) fetchTodos();
  }, [isAuthenticated, fetchTodos]);

  // ── CRUD operations with toasts ──

  const handleCreate = async (data: TodoFormData) => {
    try {
      const res = await api.post('/todos', data);
      setTodos((prev) => [res.data.todo, ...prev]);
      fetchTodos();
      toast.info('Tugas ditambahkan!', `"${data.title}" berhasil dibuat`);
    } catch {
      toast.addToast('danger', 'Gagal menambahkan', 'Coba lagi beberapa saat');
    }
  };

  const handleUpdate = async (data: TodoFormData) => {
    if (!editingTodo) return;
    try {
      const res = await api.put(`/todos/${editingTodo.id}`, data);
      setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? res.data.todo : t)));
      fetchTodos();
      toast.warning('Tugas diperbarui!', `"${data.title}" berhasil diedit`);
    } catch {
      toast.addToast('danger', 'Gagal mengedit', 'Coba lagi beberapa saat');
    }
  };

  const handleToggle = async (id: number) => {
    const target = todos.find((t) => t.id === id);
    try {
      const res = await api.patch(`/todos/${id}/toggle`);
      setTodos((prev) => prev.map((t) => (t.id === id ? res.data.todo : t)));
      fetchTodos();

      if (!target?.is_completed) {
        // Was pending → now completed
        toast.success('Tugas selesai! 🎉', `"${target?.title}" telah diselesaikan`);
      } else {
        // Was completed → now pending
        toast.addToast('info', 'Ditandai belum selesai', `"${target?.title}" dibuka kembali`);
      }
    } catch {
      toast.addToast('danger', 'Gagal memperbarui status', 'Coba lagi beberapa saat');
    }
  };

  const handleDelete = async (id: number) => {
    const target = todos.find((t) => t.id === id);
    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      fetchTodos();
      toast.danger('Tugas dihapus', `"${target?.title}" telah dihapus`);
    } catch {
      toast.addToast('danger', 'Gagal menghapus', 'Coba lagi beberapa saat');
    }
  };

  // Search filter (client-side)
  const filteredTodos = todos.filter((t) =>
    search.trim()
      ? t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar stats={stats} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Progress + Header */}
        <div className="animate-fade-in" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>My Tasks</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {stats.pending > 0
                  ? `${stats.pending} tugas${stats.pending > 1 ? '' : ''} tersisa`
                  : stats.total > 0
                  ? '🎉 Semua selesai! Kerja bagus!'
                  : 'Mulai dengan menambahkan tugas pertama'}
              </p>
            </div>
            <button
              id="add-todo-btn"
              className="btn-primary"
              onClick={() => { setEditingTodo(null); setShowForm(true); }}
              style={{ gap: 8 }}
            >
              <Plus size={17} />
              Tambah Tugas
            </button>
          </div>

          {/* Progress bar */}
          {stats.total > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progress keseluruhan</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{completionPct}%</span>
              </div>
              <div style={{
                height: 6,
                background: 'var(--bg-card)',
                borderRadius: 99,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${completionPct}%`,
                  background: `linear-gradient(90deg, var(--accent), var(--success))`,
                  borderRadius: 99,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="animate-fade-in" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}>
          {[
            { label: 'Total',     value: stats.total,     color: 'var(--accent)',   bg: 'var(--accent-glow)'  },
            { label: 'Aktif',     value: stats.pending,   color: 'var(--warning)',  bg: 'var(--warning-bg)'   },
            { label: 'Selesai',   value: stats.completed, color: 'var(--success)',  bg: 'var(--success-bg)'   },
            { label: 'Terlambat', value: stats.overdue,   color: 'var(--danger)',   bg: 'var(--danger-bg)'    },
          ].map((stat) => (
            <div key={stat.label} className="glass-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="animate-fade-in" style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={16} style={{
              position: 'absolute', left: 13, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              id="search-input"
              type="text"
              className="input-field"
              placeholder="Cari tugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <TodoFiltersBar filters={filters} onChange={setFilters} />
        </div>

        {/* Todo List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
            ))}
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '60px 24px',
            color: 'var(--text-muted)',
          }}>
            <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
              {search ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas'}
            </p>
            <p style={{ fontSize: 14 }}>
              {search ? 'Coba kata kunci lain' : 'Klik "Tambah Tugas" untuk memulai!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTodos.map((todo, i) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={(t) => { setEditingTodo(t); setShowForm(true); }}
                onDelete={handleDelete}
                style={{ animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <TodoForm
          todo={editingTodo}
          onSubmit={editingTodo ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditingTodo(null); }}
        />
      )}

      {/* 🔔 Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
