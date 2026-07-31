import { ShieldAlert } from 'lucide-react';
import SignOutButton from './SignOutButton';

/**
 * 로그인은 됐지만 관리자 화이트리스트(public.admins)에 없는 계정에게 보이는 화면.
 *
 * 여기서 "권한이 없다"고 분명히 말해주지 않으면, 로그인 성공 → 빈 화면 →
 * 로그인 실패로 오해 → 비밀번호 재설정 시도로 이어진다.
 */
export default function NotAdmin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-5">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-ink mb-2">관리자 권한이 없는 계정입니다</h1>
        <p className="text-[0.9375rem] text-slate-600 leading-relaxed mb-6 break-keep">
          로그인은 되었지만 이 계정은 관리자 목록에 등록되어 있지 않습니다.
          Supabase의 <code className="font-mono text-sm bg-slate-200 px-1.5 py-0.5 rounded">public.admins</code>{' '}
          테이블에 계정을 추가해야 접근할 수 있습니다.
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
