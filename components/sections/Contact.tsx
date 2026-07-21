import { Phone, Smartphone, Printer, Mail, MapPin, Clock, Navigation } from 'lucide-react';
import KakaoIcon from '@/components/KakaoIcon';
import { COMPANY, KAKAO_CHANNEL_URL } from '@/lib/site';
import { Section, Container, SectionHeading } from '@/components/ui/section';

const contactItems = [
  { icon: Phone,       label: '대표 전화', value: COMPANY.phone,        href: `tel:${COMPANY.phone}` },
  { icon: Smartphone,  label: '모바일',    value: COMPANY.mobile,       href: `tel:${COMPANY.mobile}` },
  { icon: Printer,     label: '팩스',      value: COMPANY.fax,          href: null },
  { icon: Mail,        label: '이메일',    value: COMPANY.email,        href: `mailto:${COMPANY.email}` },
  { icon: MapPin,      label: '주소',      value: COMPANY.address.full, href: null },
  { icon: Clock,       label: '영업시간',  value: '평일 09:00–18:00 · 토 09:00–13:00', href: null },
];

export default function Contact() {
  const { lat, lng } = COMPANY.geo;
  const mapHref = `https://map.kakao.com/link/map/${encodeURIComponent(COMPANY.name)},${lat},${lng}`;
  const routeHref = `https://map.kakao.com/link/to/${encodeURIComponent(COMPANY.name)},${lat},${lng}`;

  return (
    <Section id="contact" tone="white">
      <Container>
        <SectionHeading eyebrow="오시는 길" title="연락처·오시는 길" lead="언제든지 편하게 연락 주세요." />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {contactItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-brand-tint flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-400 font-medium mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-[0.9375rem] sm:text-base text-ink font-semibold hover:text-brand transition-colors break-keep">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-[0.9375rem] sm:text-base text-ink font-semibold break-keep">{item.value}</p>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`tel:${COMPANY.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                전화 상담
              </a>
              <a
                href={routeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-brand/25 text-brand font-semibold px-6 py-3 rounded-lg hover:bg-brand-tint transition-colors"
              >
                <Navigation className="w-4 h-4" />
                길찾기
              </a>
              {KAKAO_CHANNEL_URL && (
                <a
                  href={KAKAO_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors text-[#3C1E1E] hover:brightness-95"
                  style={{ backgroundColor: '#FEE500' }}
                >
                  <KakaoIcon className="w-4 h-4" />
                  카카오톡 상담
                </a>
              )}
            </div>
          </div>

          {/* 지도 — 정적 이미지 확보 전까지는 카카오맵 링크 카드로 둔다 */}
          <div data-reveal className="rounded-xl overflow-hidden border border-slate-200 tech-light">
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center aspect-[4/3] hover:bg-brand-tint/40 transition-colors"
              aria-label="카카오맵에서 우앤주전력 위치 보기"
            >
              <div className="text-center px-8">
                <MapPin className="w-11 h-11 text-brand mx-auto mb-3" />
                <p className="font-bold text-ink mb-1">{COMPANY.name}</p>
                <p className="text-sm text-slate-500">{COMPANY.address.full}</p>
                <p className="text-sm text-brand mt-3 font-semibold">카카오맵에서 보기 →</p>
              </div>
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
