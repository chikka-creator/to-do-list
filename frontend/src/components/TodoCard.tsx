'use client';

import { useState } from 'react';
import { Check, Pencil, Trash2, Calendar, Clock, Flag, AlertTriangle, PartyPopper } from 'lucide-react';
import type { Todo } from '@/types/todo';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  style?: React.CSSProperties;
}

const PRIORITY_COLORS = {
  low:    { color: 'var(--low)',     bg: 'var(--low-bg)',     label: 'Low'    },
  medium: { color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'Medium' },
  high:   { color: 'var(--danger)',  bg: 'var(--danger-bg)',  label: 'High'   },
};

interface DeadlineInfo {
  label: string;
  chipClass: string;
  icon: React.ReactNode;
  daysLeft: number | null;
}

function getDeadlineInfo(dateStr: string, isCompleted: boolean): DeadlineInfo {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((date.getTime() - today.getTime()) / 86400000);

  if (isCompleted) {
    const fullDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return {
      label: fullDate,
      chipClass: 'normal',
      icon: <Calendar size={12} />,
      daysLeft: diff,
    };
  }

  if (diff < 0) {
    const days = Math.abs(diff);
    return {
      label: `Terlambat ${days} hari`,
      chipClass: 'overdue',
      icon: <AlertTriangle size={12} />,
      daysLeft: diff,
    };
  }
  if (diff === 0) {
    return {
      label: 'Deadline hari ini!',
      chipClass: 'today',
      icon: <Clock size={12} />,
      daysLeft: 0,
    };
  }
  if (diff === 1) {
    return {
      label: 'Deadline besok',
      chipClass: 'soon',
      icon: <Clock size={12} />,
      daysLeft: 1,
    };
  }
  if (diff <= 3) {
    return {
      label: `${diff} hari lagi`,
      chipClass: 'soon',
      icon: <Clock size={12} />,
      daysLeft: diff,
    };
  }

  const fullDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  return {
    label: fullDate,
    chipClass: 'normal',
    icon: <Calendar size={12} />,
    daysLeft: diff,
  };
}

export default function TodoCard({ todo, onToggle, onEdit, onDelete, style }: TodoCardProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const priority = PRIORITY_COLORS[todo.priority];

  const handleToggle = async () => {
    setToggling(true);
    try {
      // Burst animation when marking complete
      if (!todo.is_completed) setJustCompleted(true);
      await onToggle(todo.id);
    } catch {
      setJustCompleted(false);
    } finally {
      setToggling(false);
      setTimeout(() => setJustCompleted(false), 600);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } catch {
      // error already handled upstream
    } finally {
      setDeleting(false);
    }
  };

  const deadline = todo.due_date ? getDeadlineInfo(todo.due_date, todo.is_completed) : null;

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        opacity: todo.is_completed ? 0.65 : 1,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Burst effect when completed */}
      {justCompleted && <div className="complete-burst" />}

      {/* Checkbox */}
      <button
        className={`todo-checkbox ${todo.is_completed ? 'checked' : ''}`}
        onClick={handleToggle}
        disabled={toggling}
        style={{ marginTop: 2 }}
        aria-label={todo.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
      >
        {toggling ? (
          <div className="spinner" style={{
            width: 12, height: 12,
            border: '2px solid rgba(255,255,255,0.4)',
            borderTop: '2px solid white',
            borderRadius: '50%',
          }} />
        ) : todo.is_completed ? (
          <Check size={13} color="white" strokeWidth={3} />
        ) : null}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--text-primary)',
              textDecoration: todo.is_completed ? 'line-through' : 'none',
              wordBreak: 'break-word',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              {todo.title}
              {todo.is_completed && (
                <PartyPopper size={14} color="var(--success)" style={{ flexShrink: 0 }} />
              )}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <button className="btn-icon" onClick={() => onEdit(todo)} aria-label="Edit tugas">
              <Pencil size={14} />
            </button>
            <button
              className="btn-icon"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Hapus tugas"
              style={{ color: deleting ? 'var(--danger)' : undefined }}
            >
              {deleting ? (
                <div className="spinner" style={{
                  width: 12, height: 12,
                  border: '2px solid var(--danger)',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                }} />
              ) : <Trash2 size={14} />}
            </button>
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginTop: 4,
            lineHeight: 1.5,
            wordBreak: 'break-word',
          }}>
            {todo.description}
          </p>
        )}

        {/* ── Deadline block ── */}
        {deadline && (
          <div style={{
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 10,
            background: todo.is_completed
              ? 'rgba(34,211,160,0.04)'
              : deadline.chipClass === 'overdue'
              ? 'rgba(244,63,94,0.04)'
              : 'rgba(136,136,168,0.04)',
            border: `1px solid ${
              todo.is_completed
                ? 'rgba(34,211,160,0.12)'
                : deadline.chipClass === 'overdue'
                ? 'rgba(244,63,94,0.12)'
                : 'var(--border)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className={`deadline-chip ${todo.is_completed ? 'normal' : deadline.chipClass}`}>
                {deadline.icon}
                {deadline.label}
              </span>
            </div>

            {/* Days left meter */}
            {!todo.is_completed && deadline.daysLeft !== null && deadline.daysLeft > 0 && deadline.daysLeft <= 7 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  display: 'flex',
                  gap: 2,
                }}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 4,
                        height: 12,
                        borderRadius: 2,
                        background: i < deadline.daysLeft!
                          ? deadline.daysLeft! <= 2
                            ? 'var(--danger)'
                            : deadline.daysLeft! <= 4
                            ? '#fb923c'
                            : 'var(--accent)'
                          : 'var(--border)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {deadline.daysLeft}d
                </span>
              </div>
            )}

            {/* Overdue days counter */}
            {!todo.is_completed && deadline.daysLeft !== null && deadline.daysLeft < 0 && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--danger)',
                padding: '2px 8px',
                background: 'var(--danger-bg)',
                borderRadius: 20,
              }}>
                +{Math.abs(deadline.daysLeft)} hari
              </span>
            )}

            {/* Completed date */}
            {todo.is_completed && todo.completed_at && (
              <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={11} strokeWidth={3} />
                Selesai {new Date(todo.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        )}

        {/* Bottom badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: todo.due_date ? 8 : 10, flexWrap: 'wrap' }}>
          {/* Priority */}
          <span className="badge" style={{ color: priority.color, background: priority.bg }}>
            <Flag size={10} />
            {priority.label}
          </span>

          {/* Completed at when no due_date */}
          {todo.is_completed && todo.completed_at && !todo.due_date && (
            <span style={{ fontSize: 11, color: 'var(--success)', marginLeft: 'auto' }}>
              ✓ Selesai {new Date(todo.completed_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
