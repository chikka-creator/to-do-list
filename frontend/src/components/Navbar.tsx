'use client';

import { useRouter } from 'next/navigation';
import { CheckSquare, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface NavbarProps {
  stats?: { total: number; completed: number; pending: number; overdue: number };
}

export default function Navbar({ stats }: NavbarProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,15,0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckSquare size={17} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Taskly</span>
          {stats && (
            <div style={{
              display: 'flex', gap: 12, marginLeft: 16,
              paddingLeft: 16, borderLeft: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{stats.total}</strong> tasks
              </span>
              <span style={{ fontSize: 12, color: 'var(--success)' }}>
                <strong>{stats.completed}</strong> done
              </span>
              {stats.overdue > 0 && (
                <span style={{ fontSize: 12, color: 'var(--danger)' }}>
                  <strong>{stats.overdue}</strong> overdue
                </span>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={13} color="white" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              {user?.name}
            </span>
          </div>

          <button
            id="logout-btn"
            className="btn-ghost"
            onClick={handleLogout}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
