'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <button onClick={signOut} className="a-btn a-btn--dark">
      <LogOut className="w-4 h-4" strokeWidth={1.5} />
      다른 계정으로 로그인
    </button>
  );
}
