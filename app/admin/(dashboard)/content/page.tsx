import Link from 'next/link';
import { ChevronRight, Pencil } from 'lucide-react';
import { SECTION_DEFS } from '@/lib/content/schema';
import { getAllSectionStates } from '@/lib/content/admin';
import PageHeader from '@/components/admin/PageHeader';

export default async function ContentIndexPage() {
  const states = await getAllSectionStates();
  const pendingCount = Object.values(states).filter((s) => s.hasDraft).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="홈페이지 편집"
        description="바꾸고 싶은 영역을 고르세요. 문구를 고치면 오른쪽 미리보기에 바로 나타나고, [발행]을 눌러야 실제 사이트에 반영됩니다."
      />

      {pendingCount > 0 && (
        <p className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          발행되지 않은 수정이 <strong>{pendingCount}곳</strong> 있습니다. 해당 영역에 들어가 [발행]을 눌러주세요.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTION_DEFS.map((section) => {
          const state = states[section.key];
          return (
            <Link
              key={section.key}
              href={`/admin/content/${section.key}`}
              className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-tint flex items-center justify-center flex-shrink-0 group-hover:bg-brand transition-colors">
                <Pencil className="w-5 h-5 text-brand group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-bold text-ink truncate">{section.label}</h2>
                  {state?.hasDraft && (
                    <span className="text-[0.6875rem] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 flex-shrink-0">
                      발행 대기
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed break-keep">{section.summary}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand transition-colors flex-shrink-0 mt-2" />
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-slate-500 leading-relaxed rounded-lg bg-white border border-slate-200 px-4 py-3.5 break-keep">
        <strong className="text-ink">여기서 못 바꾸는 것</strong> — 회사 등록번호·전화번호 같은 사업자 정보와
        서비스 상세 페이지의 긴 기술 설명은 실수로 바뀌면 신뢰가 깨지는 값이라 코드에서 관리합니다.
        수정이 필요하면 개발자에게 요청하세요.
      </p>
    </div>
  );
}
