import { Phone, Smartphone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

const contactItems = [
  { icon: Phone,         label: '대표 전화', value: '053-525-0424',         href: 'tel:053-525-0424' },
  { icon: Smartphone,   label: '모바일',   value: '010-8552-9994',         href: 'tel:010-8552-9994' },
  { icon: Mail,          label: '이메일',   value: 'wnj-2023@naver.com',    href: 'mailto:wnj-2023@naver.com' },
  { icon: MapPin,        label: '주소',     value: '대구광역시 서구 문화로63길 19, 1층 (평리동)', href: null },
  { icon: Clock,         label: '영업시간', value: '평일 09:00–18:00',      href: null },
];

export default function Contact() {
  const mapHref = 'https://map.kakao.com/link/search/대구광역시 서구 문화로63길 19';

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">오시는 길·연락처</h2>
          <p className="text-lg text-gray-500">언제든지 편하게 연락 주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 연락처 정보 */}
          <div className="space-y-5">
            {contactItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0A3D91]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#0A3D91]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-lg text-[#0F172A] font-semibold hover:text-[#0A3D91] transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-lg text-[#0F172A] font-semibold">{item.value}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a
                href="tel:053-525-0424"
                className="inline-flex items-center justify-center gap-2 bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" />
                전화 상담
              </a>
              <a
                href="https://pf.kakao.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#0F172A] font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                카카오톡 상담
              </a>
            </div>
          </div>

          {/* 지도 */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-100 aspect-[4/3] flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="카카오맵에서 우앤주전력 위치 보기"
            >
              <div className="text-center text-gray-500 p-8">
                <MapPin className="w-12 h-12 text-[#0A3D91] mx-auto mb-3" />
                <p className="font-bold text-[#0F172A] mb-1">우앤주전력</p>
                <p className="text-sm">대구광역시 서구 문화로63길 19, 1층</p>
                <p className="text-xs text-[#0A3D91] mt-3 font-medium">카카오맵에서 보기 →</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
