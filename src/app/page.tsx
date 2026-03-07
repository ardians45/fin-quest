'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBudgetStore } from '@/stores';

export default function Home() {
  const router = useRouter();
  const { isOnboarded } = useBudgetStore();
  
  useEffect(() => {
    if (isOnboarded) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [isOnboarded, router]);
  
  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-float">🦊</div>
        <h1 className="text-2xl font-bold text-primary">MyDuit Quest</h1>
        <p className="text-text-secondary mt-2">Memuat...</p>
      </div>
    </div>
  );
}
