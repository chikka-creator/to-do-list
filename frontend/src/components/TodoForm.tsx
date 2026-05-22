'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import type { Todo } from '@/types/todo';

interface TodoFormProps {
  todo?: Todo | null;
  onSubmit: (data: TodoFormData) => Promise<void>;
  onClose: () => void;
}

export interface TodoFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}

export default function TodoForm({ todo, onSubmit, onClose }: TodoFormProps) {
  const isEditing = !!todo;
  const [form, setForm] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<TodoFormData>>({});

  useEffect(() => {
    if (todo) {
      setForm({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        due_date: todo.due_date || '',
      });
    }
  }, [todo]);

  const validate = () => {
    const newErrors: Partial<TodoFormData> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (form.title.length > 255) newErrors.title = 'Title must be under 255 characters';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-scale-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Task title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="todo-title"
              type="text"
              className="input-field"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: undefined }); }}
              autoFocus
              style={errors.title ? { borderColor: 'var(--danger)' } : {}}
            />
            {errors.title && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea
              id="todo-description"
              className="input-field"
              placeholder="Add some details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Priority + Due Date row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Priority
              </label>
              <select
                id="todo-priority"
                className="input-field"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TodoFormData['priority'] })}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Due date <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <input
                id="todo-due-date"
                type="date"
                className="input-field"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button id="todo-submit" type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? (
                <div className="spinner" style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                }} />
              ) : isEditing ? (
                <><Save size={15} /> Save Changes</>
              ) : (
                <><Plus size={15} /> Add Task</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
