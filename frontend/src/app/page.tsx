'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, initFromCookies } = useAuthStore();

  useEffect(() => {
    initFromCookies();
  }, [initFromCookies]);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="spinner" style={{
        width: 32,
        height: 32,
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '50%',
      }} />
    </div>
  );
}
