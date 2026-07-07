'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '4rem 0', fontFamily: 'var(--font-sans)', color: 'var(--text-dark)' }}>
      Redirecting to News Feed...
    </div>
  );
}
