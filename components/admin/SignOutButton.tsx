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
    <button
      onClick={signOut}
      className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-semibold px-5 py-3 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      다른 계정으로 로그인
    </button>
  );
}
