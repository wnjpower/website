import { Camera, Phone } from 'lucide-react';
import KakaoIcon from '@/components/KakaoIcon';
import { portfolioItems } from '@/content/portfolio';
import { COMPANY, KAKAO_CHANNEL_URL } from '@/lib/site';

const categoryColors: Record<string, string> = {
  factory:  'bg-blue-100 text-blue-700',
  power:    'bg-sky-100 text-sky-700',
  panel:    'bg-amber-100 text-amber-700',
  interior: 'bg-purple-100 text-purple-700',
};

export default function Portfolio() {
  const itemsWithPhoto = portfolioItems.filter((item) => item.image);
  const hasPhotos = itemsWithPhoto.length > 0;
  // 실사진이 한 장이라도 들어오면 안내 배너는 자동으로 사라진다
  const allPlaceholder = hasPhotos && itemsWithPhoto.every((item) => item.isPlaceholder);

  return (
    <section id="portfolio" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
            시공 사례
          </h2>
          <p className="text-lg text-gray-500">대구·경북 지역 주요 시공 실적</p>
        </div>

        {hasPhotos ? (
          <>
            {allPlaceholder && (
              <div
                data-reveal
                className="max-w-3xl mx-auto mb-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4"
              >
                <Camera className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 leading-relaxed">
                  아래 이미지는 <strong>레이아웃 확인용 샘플</strong>입니다. 실제 시공 현장 사진으로
                  순차 교체 중이며, 표기된 시공 실적은 실제 진행 건입니다.
                </p>
              </div>
            )}

            <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {itemsWithPhoto.map((item) => (
                <div key={item.id} className="rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image!}
                      alt={
                        item.isPlaceholder
                          ? `${item.location} ${item.title} — 샘플 이미지`
                          : `${item.location} ${item.title}`
                      }
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {item.isPlaceholder && (
                      <span className="absolute top-2 right-2 text-[11px] font-bold px-2 py-1 rounded bg-black/70 text-white">
                        샘플
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.categoryLabel}
                    </span>
                    <h3 className="font-bold text-[#0F172A] mt-2 mb-0.5 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-400">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 섹션 맥락에 맞춘 컨텍스트 CTA */}
            <div data-reveal className="mt-10 text-center">
              <p className="text-base text-gray-500 mb-4">
                비슷한 공사를 계획 중이신가요? 현장 방문 견적은 출장비 없이 무료입니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`tel:${COMPANY.mobile}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04A00] text-[#0F172A] font-extrabold px-6 py-3.5 rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {COMPANY.mobile}
                </a>
                <a
                  href="#quote"
                  className="inline-flex items-center justify-center gap-2 border border-[#0A3D91]/25 text-[#0A3D91] font-bold px-6 py-3.5 rounded-lg hover:bg-[#0A3D91]/5 transition-colors"
                >
                  견적문의 남기기
                </a>
              </div>
            </div>
          </>
        ) : (
          <div data-reveal className="max-w-2xl mx-auto">
            {/* 사진 확보 전: 실적 텍스트 리스트로 신뢰 유지 */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#0A3D91]/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-[#0A3D91]" />
                </div>
                <p className="text-sm text-gray-500">
                  시공 현장 사진은 순차적으로 업데이트 중입니다. 주요 시공 실적은 아래와 같습니다.
                </p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {portfolioItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0A3D91] flex-shrink-0" />
                    <span>
                      <span className="font-semibold text-[#0F172A]">{item.title}</span>
                      <span className="text-gray-400"> · {item.location}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-3">시공 사례 사진이 궁금하시면 부담 없이 문의해 주세요.</p>
                {/* 카카오톡 채널 개설 전에는 전화로 안내한다 (lib/site.ts) */}
                {KAKAO_CHANNEL_URL ? (
                  <a
                    href={KAKAO_CHANNEL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors text-[#3C1E1E] hover:brightness-95"
                    style={{ backgroundColor: '#FEE500' }}
                  >
                    <KakaoIcon className="w-4 h-4" />
                    카카오톡으로 사례 문의
                  </a>
                ) : (
                  <a
                    href={`tel:${COMPANY.mobile}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors bg-[#0A3D91] text-white hover:bg-[#0A3D91]/90"
                  >
                    <Phone className="w-4 h-4" />
                    {COMPANY.mobile} 사례 문의
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
