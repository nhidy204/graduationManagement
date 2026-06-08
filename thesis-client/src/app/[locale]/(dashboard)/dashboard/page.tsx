import { PageWrapper } from '@/components/layout/PageWrapper';
import { cn } from '@/lib/utils';
export default function DashboardPage() {
  return (
    <PageWrapper
      title="Tổng quan"
      description="Chào mừng trở lại hệ thống TMS"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng đề tài', value: '124', color: 'bg-blue-50 text-blue-700' },
          { label: 'Sinh viên có đề tài', value: '98', color: 'bg-green-50 text-green-700' },
          { label: 'Chưa có đề tài', value: '26', color: 'bg-orange-50 text-orange-700' },
          { label: 'Chờ duyệt', value: '12', color: 'bg-purple-50 text-purple-700' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={cn('mt-1 text-3xl font-bold', stat.color.split(' ')[1])}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}