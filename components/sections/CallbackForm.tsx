'use client';

import { useEffect, useRef, useState } from 'react';
import { PhoneCall, Check } from 'lucide-react';
import { toast } from 'sonner';
import { gtagEvent } from '@/components/GoogleAnalytics';
import { COMPANY } from '@/lib/site';

const TIME_SLOTS = ['아무 때나', '오전 (09–12시)', '오후 (13–18시)', '퇴근 후 (18시 이후)'];

/**
 * 콜백 퀵폼 — 견적폼 이탈층 회수용.
 *
 * 본 견적폼은 입력 요소가 9개라 B2B 기준 상한선이다. 공사 사양을 글로 적기
 * 부담스러워 이탈하는 사용자를 위해 "번호만 남기면 저희가 겁니다" 경로를 둔다.
 * 제출은 기존 /api/quote 파이프라인을 그대로 타되 source='callback'으로 구분한다.
 */
export default function CallbackForm() {
  const [phone, setPhone] = useState('');
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const loadedAt = useRef(0);

  useEffect(() => {
    loadedAt.current = Date.now();
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone)) {
      toast.error('연락처 형식을 확인해 주세요.');
      return;
    }
    if (!agree) {
      toast.error('개인정보 수집·이용에 동의해야 접수됩니다.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '콜백 요청',
          phone,
          category: 'etc',
          message: `[콜백 요청] 희망 통화 시간대: ${slot}`,
          agree: true,
          website: '',
          loadedAt: loadedAt.current,
          source: 'callback',
        }),
      });

      if (res.ok) {
        gtagEvent('callback_request', { time_slot: slot });
        setDone(true);
        toast.success('접수됐습니다. 요청하신 시간대에 전화드리겠습니다.');
      } else if (res.status === 429) {
        toast.error('제출이 너무 빠릅니다. 잠시 후 다시 시도해 주세요.');
      } else {
        toast.error(`접수에 실패했습니다. ${COMPANY.mobile}로 전화 주세요.`, { duration: 10000 });
      }
    } catch {
      toast.error('네트워크 오류가 발생했습니다. 전화로 연락 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-lg border border-[#FF5500]/30 bg-[#FF5500]/10 px-5 py-6 text-center">
        <div className="w-11 h-11 rounded-full bg-[#FF5500] flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-[#0F172A]" />
        </div>
        <p className="text-white font-bold mb-1">콜백 요청이 접수됐습니다</p>
        <p className="text-sm text-slate-300">
          <span className="font-mono tabular-nums">{phone}</span> 로 {slot}에 연락드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/15 bg-white/5 backdrop-blur-sm px-5 py-5 sm:px-6 sm:py-6"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <PhoneCall className="w-5 h-5 text-[#FF5500] flex-shrink-0" />
        <p className="text-white font-bold text-lg">작성이 번거로우신가요?</p>
      </div>
      <p className="text-sm text-slate-300 mb-4">
        번호만 남겨 주시면 저희가 전화드립니다. 공사 내용은 통화로 확인하면 됩니다.
      </p>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="연락처 (010-0000-0000)"
          aria-label="연락처"
          className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-slate-400 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF5500] focus:border-transparent"
        />
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          aria-label="희망 통화 시간대"
          className="rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5500] focus:border-transparent"
        >
          {TIME_SLOTS.map((s) => (
            <option key={s} value={s} className="text-[#0F172A]">
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#FF5500] hover:bg-[#E04A00] disabled:opacity-60 text-[#0F172A] font-extrabold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
        >
          {submitting ? '접수 중…' : '전화 요청'}
        </button>
      </div>

      <label className="flex items-start gap-2 mt-3.5 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#FF5500] flex-shrink-0"
        />
        <span>
          상담 연락을 위한 연락처 수집·이용에 동의합니다.{' '}
          <a href="/privacy" className="underline hover:text-white">
            개인정보처리방침
          </a>
        </span>
      </label>
    </form>
  );
}
