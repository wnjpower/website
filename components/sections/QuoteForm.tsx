'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { QuoteSchema, type QuoteInput, CategoryLabels, QUOTE_CATEGORIES, CUSTOMER_TYPES, CustomerTypeLabels } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Home, Store, Building2, HelpCircle } from 'lucide-react';

interface Props {
  defaultCategory?: string;
  defaultCustomerType?: string;
}

const customerTypeConfig: Record<string, { icon: typeof Home; color: string; activeColor: string }> = {
  residential:    { icon: Home,      color: 'border-gray-200 hover:border-[#0A3D91]/50', activeColor: 'border-[#0A3D91] bg-[#0A3D91]/5 ring-2 ring-[#0A3D91]/30' },
  small_business: { icon: Store,     color: 'border-gray-200 hover:border-[#0A3D91]/50', activeColor: 'border-[#0A3D91] bg-[#0A3D91]/5 ring-2 ring-[#0A3D91]/30' },
  commercial:     { icon: Building2, color: 'border-gray-200 hover:border-[#0A3D91]/50', activeColor: 'border-[#0A3D91] bg-[#0A3D91]/5 ring-2 ring-[#0A3D91]/30' },
  unknown:        { icon: HelpCircle, color: 'border-gray-200 hover:border-gray-400',    activeColor: 'border-gray-500 bg-gray-50 ring-2 ring-gray-300' },
};

const visibleCustomerTypes = CUSTOMER_TYPES.filter((t) => t !== 'unknown');

export default function QuoteForm({ defaultCategory, defaultCustomerType }: Props) {
  const loadedAtRef = useRef(Date.now());
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: {
      category:     (defaultCategory as QuoteInput['category']) ?? 'electric',
      customerType: (defaultCustomerType as QuoteInput['customerType']) ?? undefined,
      source:       'main_form',
      loadedAt:     loadedAtRef.current,
    },
  });

  useEffect(() => {
    if (defaultCategory) {
      setValue('category', defaultCategory as QuoteInput['category']);
    }
  }, [defaultCategory, setValue]);

  useEffect(() => {
    if (defaultCustomerType) {
      setValue('customerType', defaultCustomerType as QuoteInput['customerType']);
    }
  }, [defaultCustomerType, setValue]);

  const agree = watch('agree');
  const selectedCustomerType = watch('customerType');

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

      setSubmitted(true);
      toast.success('견적 문의가 접수됐습니다! 1영업일 내 연락드립니다.');
    } catch {
      toast.error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="animate-pop w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path className="animate-check-draw" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="animate-fade-up text-xl font-bold text-[#0F172A] mb-2" style={{ animationDelay: '0.2s' }}>접수 완료!</h3>
        <p className="animate-fade-up text-gray-500" style={{ animationDelay: '0.3s' }}>1영업일 내에 연락드리겠습니다.</p>
        <p className="animate-fade-up text-sm text-gray-400 mt-1" style={{ animationDelay: '0.4s' }}>빠른 상담: 053-525-0424</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* honeypot */}
      <input type="text" {...register('website')} className="hidden" tabIndex={-1} aria-hidden />
      <input type="hidden" {...register('loadedAt', { valueAsNumber: true })} />
      <input type="hidden" {...register('source')} />

      {/* 고객 유형 선택 */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">
          고객 유형 <span className="text-gray-400 font-normal">(선택)</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {visibleCustomerTypes.map((type) => {
            const cfg = customerTypeConfig[type];
            const isActive = selectedCustomerType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setValue('customerType', isActive ? undefined : type)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
                  isActive ? cfg.activeColor : cfg.color + ' bg-white'
                }`}
              >
                <cfg.icon className={`w-6 h-6 ${isActive ? 'text-[#0A3D91]' : 'text-gray-400'}`} />
                <span className={`text-sm font-semibold leading-tight ${isActive ? 'text-[#0F172A]' : 'text-gray-600'}`}>
                  {CustomerTypeLabels[type].replace(' (', '\n(').split('\n')[0]}
                </span>
                <span className={`text-xs leading-tight ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                  {CustomerTypeLabels[type].match(/\(([^)]+)\)/)?.[1] ?? ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* 이름 */}
        <div className="group">
          <label className="block text-sm font-semibold text-[#0F172A] mb-1.5 transition-colors group-focus-within:text-[#0A3D91]">
            이름 <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('name')}
            placeholder="홍길동"
            className={errors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* 연락처 */}
        <div className="group">
          <label className="block text-sm font-semibold text-[#0F172A] mb-1.5 transition-colors group-focus-within:text-[#0A3D91]">
            연락처 <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('phone')}
            type="tel"
            placeholder="010-0000-0000"
            className={errors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      {/* 지역 */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">지역</label>
        <Input {...register('region')} placeholder="예) 대구 서구, 경북 경산" />
      </div>

      {/* 문의 유형 */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          문의 유형 <span className="text-red-500">*</span>
        </label>
        <select
          {...register('category')}
          className={`w-full rounded-xl border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3D91] ${
            errors.category ? 'border-red-400' : 'border-input'
          }`}
        >
          {QUOTE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CategoryLabels[cat]}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
      </div>

      {/* 상세 내용 */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">상세 내용</label>
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
          '무료 견적 신청하기'
        )}
      </Button>
    </form>
  );
}
