import LiveDashboard from '@/components/admin/LiveDashboard';
import PageHeader from '@/components/admin/PageHeader';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="실시간 현황"
        description="방문자와 문의가 지금 어떻게 들어오고 있는지 보여줍니다. 15초마다 자동으로 갱신됩니다."
      />
      <LiveDashboard />
    </div>
  );
}
