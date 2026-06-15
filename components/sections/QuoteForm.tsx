'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  QuoteSchema,
  type QuoteInput,
  CategoryLabels,
  CATEGORIES_BY_CUSTOMER_TYPE,
  CUSTOMER_TYPES,
  CustomerTypeLabels,
} from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Factory, Lamp, HelpCircle } from 'lucide-react';
import { gtagEvent } from '@/components/GoogleAnalytics';

interface Props {
  defaultCategory?: string;
  defaultCustomerType?: string;
}

// 국내 주요 이메일 도메인 (첫 글자 입력 시 자동완성)
const EMAIL_DOMAINS = [
  'naver.com',
  'gmail.com',
  'kakao.com',
  'daum.net',
  'hanmail.net',
  'nate.com',
  'outlook.com',
  'yahoo.co.kr',
];

// 전화번호 자동 하이픈 포맷 (숫자만 입력 → 010-XXXX-XXXX)
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

const customerTypeConfig: Record<string, { icon: typeof Factory; label: string; sub: string; color: string; activeColor: string }> = {
  industrial: { icon: Factory,    label: '공장·산업 전기', sub: '신축·증축·수전·배전반',  color: 'border-gray-200 hover:border-[#0A3D91]/50', activeColor: 'border-[#0A3D91] bg-[#0A3D91]/5 ring-2 ring-[#0A3D91]/30' },
  interior:   { icon: Lamp,       label: '인테리어·일반 전기', sub: '상업공간·병원·주택', color: 'border-gray-200 hover:border-[#0A3D91]/50', activeColor: 'border-[#0A3D91] bg-[#0A3D91]/5 ring-2 ring-[#0A3D91]/30' },
  unknown:    { icon: HelpCircle, label: '잘 모르겠어요', sub: '기타',                   color: 'border-gray-200 hover:border-gray-400',    activeColor: 'border-gray-500 bg-gray-50 ring-2 ring-gray-300' },
};

const legacyCategoryMap: Record<string, string> = {
  factory:  'factory_new',
  power:    'power_receiving',
  panel:    'switchboard',
  interior: 'interior_store',
  electric: 'factory_new',
};

const visibleCustomerTypes = CUSTOMER_TYPES.filter((t) => t !== 'unknown');

export default function QuoteForm({ defaultCategory, defaultCustomerType }: Props) {
  const loadedAtRef = useRef(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [alimtalkSent, setAlimtalkSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const resolvedCategory = defaultCategory
    ? (legacyCategoryMap[defaultCategory] ?? defaultCategory)
    : 'factory_new';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: {
      category:     resolvedCategory as QuoteInput['category'],
      customerType: (defaultCustomerType as QuoteInput['customerType']) ?? 'industrial',
      source:       'main_form',
      loadedAt:     loadedAtRef.current,
    },
  });

  useEffect(() => {
    if (defaultCategory) {
      const mapped = legacyCategoryMap[defaultCategory] ?? defaultCategory;
      setValue('category', mapped as QuoteInput['category']);
    }
  }, [defaultCategory, setValue]);

  useEffect(() => {
    if (defaultCustomerType) {
      setValue('customerType', defaultCustomerType as QuoteInput['customerType']);
    }
  }, [defaultCustomerType, setValue]);

  const agree = watch('agree');
  const selectedCustomerType = watch('customerType');
  const selectedCategory = watch('category');
  const emailValue = watch('email') ?? '';

  const availableCategories = CATEGORIES_BY_CUSTOMER_TYPE[selectedCustomerType ?? 'unknown'];

  useEffect(() => {
    if (selectedCustomerType && !availableCategories.includes(selectedCategory as never)) {
      setValue('category', availableCategories[0]);
    }
  }, [selectedCustomerType, availableCategories, selectedCategory, setValue]);

  // 이메일 도메인 자동완성 계산
  const atIdx = emailValue.indexOf('@');
  const domainPart = atIdx >= 0 ? emailValue.slice(atIdx + 1).toLowerCase() : '';
  const emailSuggestions =
    atIdx >= 0 && !EMAIL_DOMAINS.includes(domainPart)
      ? EMAIL_DOMAINS.filter((d) => !domainPart || d.startsWith(domainPart))
      : [];
  const showEmailDropdown = emailFocused && emailSuggestions.length > 0;

  // register에서 phone onChange를 꺼내 포맷 로직 삽입
  const { onChange: phoneOnChange, ...phoneRest } = register('phone');

  const onSubmit = async (data: QuoteInput) => {
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, loadedAt: loadedAtRef.current }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 429) {
          toast.error('제출이 너무 빠릅니다. 잠시 후 다시 시도해 주세요.');
        } else {
          toast.error(json?.message ?? '오류가 발생했습니다. 다시 시도해 주세요.');
        }
        return;
      }

      const json = await res.json().catch(() => ({}));
      setSubmittedPhone(data.phone);
      setAlimtalkSent(Boolean(json?.alimtalkSent));
      setSubmitted(true);
      gtagEvent('generate_lead', { category: data.category });
      toast.success('견적 문의가 접수됐습니다! 1영업일 내 연락드립니다.');
    } catch {
      toast.error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  if (submitted) {
    return (
      <div className="py-10">
        {/* 체크 아이콘 */}
        <div className="text-center mb-6">
          <div className="animate-pop w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path className="animate-check-draw" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="animate-fade-up text-xl font-bold text-[#0F172A] mb-2" style={{ animationDelay: '0.2s' }}>
            접수 완료!
          </h3>
          <p className="animate-fade-up text-gray-500" style={{ animationDelay: '0.3s' }}>
            1영업일 내에 담당자가 직접 연락드리겠습니다.
          </p>
        </div>

        {/* 카카오 알림톡 안내 (실제 발송된 경우에만 표시) */}
        {alimtalkSent && (
          <div className="animate-fade-up rounded-xl border border-[#FEE500] bg-[#FFFDE7] px-5 py-4 mb-4" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-1.5">
              {/* 카카오 로고 컬러 아이콘 */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#3C1E1E">
                <path d="M12 3C7.037 3 3 6.373 3 10.5c0 2.666 1.614 5.01 4.065 6.41L6.1 20.4a.3.3 0 0 0 .432.326l4.605-3.058A10.7 10.7 0 0 0 12 18c4.963 0 9-3.373 9-7.5S16.963 3 12 3z"/>
              </svg>
              <span className="text-sm font-bold text-[#3C1E1E]">카카오 알림톡이 발송되었습니다</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">{submittedPhone}</span>로 접수 확인 메시지를 보내드렸습니다.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              카카오 계정이 연동되지 않은 번호는 문자(SMS)로 대신 전송됩니다.
            </p>
          </div>
        )}

        {/* 빠른 연락 안내 */}
        <div className="animate-fade-up rounded-xl bg-[#F8FAFC] border border-gray-100 px-5 py-4 text-center" style={{ animationDelay: alimtalkSent ? '0.5s' : '0.4s' }}>
          <p className="text-sm text-gray-500 mb-2">급하신 경우 직접 연락 주세요</p>
          <a
            href="tel:010-8552-9994"
            className="inline-flex items-center gap-2 bg-[#FF5500] text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#E04A00] transition-colors"
          >
            📞 010-8552-9994 바로 전화
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <input type="text" {...register('website')} className="hidden" tabIndex={-1} aria-hidden />
      <input type="hidden" {...register('loadedAt', { valueAsNumber: true })} />
      <input type="hidden" {...register('source')} />

      {/* STEP 1: 고객 유형 선택 */}
      <div>
        <p className="text-sm font-bold text-[#0A3D91] mb-1 tracking-wide">STEP 1</p>
        <p className="text-base font-semibold text-[#0F172A] mb-3">어떤 상황이신가요?</p>
        <div className="grid grid-cols-2 gap-2">
          {visibleCustomerTypes.map((type) => {
            const cfg = customerTypeConfig[type];
            const isActive = selectedCustomerType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setValue('customerType', type)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
                  isActive ? cfg.activeColor : cfg.color + ' bg-white'
                }`}
              >
                <cfg.icon className={`w-6 h-6 ${isActive ? 'text-[#0A3D91]' : 'text-gray-400'}`} />
                <span className={`text-sm font-bold leading-tight ${isActive ? 'text-[#0F172A]' : 'text-gray-600'}`}>
                  {cfg.label}
                </span>
                <span className={`text-xs leading-tight ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                  {cfg.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: 공사 종류 */}
      <div>
        <p className="text-sm font-bold text-[#0A3D91] mb-1 tracking-wide">STEP 2</p>
        <label className="block text-base font-semibold text-[#0F172A] mb-3">
          공사 종류를 선택해 주세요 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setValue('category', cat)}
                className={`text-left px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'border-[#0A3D91] bg-[#0A3D91]/5 text-[#0A3D91] ring-2 ring-[#0A3D91]/20'
                    : 'border-gray-200 text-gray-600 hover:border-[#0A3D91]/40 bg-white'
                }`}
              >
                {CategoryLabels[cat]}
              </button>
            );
          })}
        </div>
        <input type="hidden" {...register('category')} />
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
      </div>

      {/* STEP 3: 연락처 */}
      <div>
        <p className="text-sm font-bold text-[#0A3D91] mb-1 tracking-wide">STEP 3</p>
        <p className="text-base font-semibold text-[#0F172A] mb-3">연락처를 남겨주세요</p>
        <div className="space-y-4">

          {/* 업체명 */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              업체명 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <Input {...register('companyName')} placeholder="예) (주)우앤주전력, 대구건설" />
          </div>

          {/* 성함 + 연락처 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5 transition-colors group-focus-within:text-[#0A3D91]">
                성함 <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="홍길동"
                className={errors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5 transition-colors group-focus-within:text-[#0A3D91]">
                연락처 <span className="text-red-500">*</span>
              </label>
              <Input
                {...phoneRest}
                type="tel"
                inputMode="numeric"
                placeholder="010-0000-0000"
                className={errors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  e.target.value = formatted;
                  phoneOnChange(e);
                }}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* 이메일 — 도메인 자동완성 */}
          <div className="group">
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5 transition-colors group-focus-within:text-[#0A3D91]">
              이메일 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <div className="relative">
              <Input
                {...register('email')}
                type="email"
                autoComplete="off"
                placeholder="example@email.com"
                className={errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setTimeout(() => setEmailFocused(false), 150)}
              />
              {showEmailDropdown && (
                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
                  {emailSuggestions.map((domain) => {
                    const prefix = atIdx >= 0 ? emailValue.slice(0, atIdx + 1) : '';
                    return (
                      <li key={domain}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#0A3D91]/5 transition-colors border-b border-gray-50 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault(); // blur 방지
                            setValue('email', prefix + domain, { shouldValidate: true });
                            setEmailFocused(false);
                          }}
                        >
                          <span className="text-gray-500">{prefix}</span>
                          <span className="font-semibold text-[#0A3D91]">{domain}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* 시공 지역 */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              시공 지역 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <Input {...register('region')} placeholder="예) 대구 서구, 경북 경산" />
          </div>
        </div>
      </div>

      {/* STEP 4: 상세 내용 */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          상세 내용 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <Textarea
          {...register('message')}
          rows={4}
          placeholder="시공 장소, 면적, 요청 사항 등을 자유롭게 적어 주세요 (최대 1,000자)"
          maxLength={1000}
        />
      </div>

      {/* 개인정보 동의 */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="agree"
          checked={!!agree}
          onCheckedChange={(v) => setValue('agree', v === true ? true : (undefined as unknown as true))}
          className={errors.agree ? 'border-red-400' : ''}
        />
        <label htmlFor="agree" className="text-sm text-gray-600 leading-snug cursor-pointer">
          <span className="font-semibold">[필수]</span> 개인정보 수집·이용에 동의합니다.{' '}
          <a href="/privacy" target="_blank" className="text-[#0A3D91] underline">
            개인정보처리방침
          </a>
        </label>
      </div>
      {errors.agree && <p className="text-xs text-red-500 -mt-3">{errors.agree.message}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#0A3D91] hover:bg-[#0A3D91]/90 text-white font-bold py-4 text-lg rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0A3D91]/25 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            접수 중…
          </>
        ) : (
          '무료 현장 견적 신청하기'
        )}
      </Button>
    </form>
  );
}
