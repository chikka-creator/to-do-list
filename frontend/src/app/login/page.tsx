'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, CheckSquare, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', form);
      setAuth(res.data.user, res.data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at top left, rgba(108,99,255,0.08) 0%, transparent 50%), var(--bg-primary)',
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'var(--accent)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckSquare size={22} color="white" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
              Taskly
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Welcome back! Sign in to your account.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: 'var(--text-primary)' }}>
            Sign In
          </h1>

          {error && (
            <div className="animate-fade-in" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: 10,
              marginBottom: 20,
              color: 'var(--danger)',
              fontSize: 13,
            }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: 6,
              }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: 6,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 8, width: '100%', padding: '13px 20px' }}
            >
              {loading ? (
                <div className="spinner" style={{
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                }} />
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 14,
          color: 'var(--text-secondary)',
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
