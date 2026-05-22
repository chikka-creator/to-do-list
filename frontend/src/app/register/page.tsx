'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, CheckSquare, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      const res = await api.post('/auth/register', form);
      setAuth(res.data.user, res.data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setGeneralError(error.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string) => errors[field]?.[0];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at top right, rgba(108,99,255,0.08) 0%, transparent 50%), var(--bg-primary)',
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, background: 'var(--accent)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckSquare size={22} color="white" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 700 }}>Taskly</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Create your free account to get started.
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
            Create Account
          </h1>

          {generalError && (
            <div className="animate-fade-in" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', background: 'var(--danger-bg)',
              border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10,
              marginBottom: 20, color: 'var(--danger)', fontSize: 13,
            }}>
              <AlertCircle size={15} />
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
                style={getFieldError('name') ? { borderColor: 'var(--danger)' } : {}}
              />
              {getFieldError('name') && (
                <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{getFieldError('name')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
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
                style={getFieldError('email') ? { borderColor: 'var(--danger)' } : {}}
              />
              {getFieldError('email') && (
                <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{getFieldError('email')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 44, ...(getFieldError('password') ? { borderColor: 'var(--danger)' } : {}) }}
                />
                <button type="button" className="btn-icon" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {getFieldError('password') && (
                <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{getFieldError('password')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Confirm password
              </label>
              <input
                id="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Repeat your password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                required
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 8, width: '100%', padding: '13px 20px' }}
            >
              {loading ? (
                <div className="spinner" style={{
                  width: 18, height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white', borderRadius: '50%',
                }} />
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
