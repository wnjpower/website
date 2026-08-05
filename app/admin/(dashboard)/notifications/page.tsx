import PageHeader from '@/components/admin/PageHeader';
import PushManager from '@/components/admin/PushManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '알림 설정',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        no="07"
        title="알림 설정"
        description="방문자가 전화·카카오톡·견적문의 버튼을 누르면 사장님 휴대폰과 PC에 즉시 알림이 뜹니다. 알림을 받을 기기를 여기서 등록하세요."
      />
      <PushManager />
    </div>
  );
}
