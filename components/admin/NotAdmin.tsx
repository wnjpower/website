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
    <div className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="a-panel max-w-md text-center" style={{ padding: '32px 28px' }}>
        <ShieldAlert
          className="w-8 h-8 mx-auto mb-4"
          strokeWidth={1.5}
          style={{ color: 'var(--a-warn)' }}
        />
        <h1 style={{ fontSize: 22, marginBottom: 10 }}>관리자 권한이 없는 계정입니다</h1>
        <p className="break-keep mb-6" style={{ fontSize: 14, lineHeight: 1.7 }}>
          로그인은 되었지만 이 계정은 관리자 목록에 등록되어 있지 않습니다. Supabase의{' '}
          <code className="mono-num" style={{ background: 'var(--color-neutral-100)', padding: '1px 5px' }}>
            public.admins
          </code>{' '}
          테이블에 계정을 추가해야 접근할 수 있습니다.
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
