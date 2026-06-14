import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { Resend } from 'resend';
import { QuoteSchema, CategoryLabels, CustomerTypeLabels } from '@/lib/validators';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 빌드 시 API 키 검증 우회 - 런타임에 초기화
const getResend = () => new Resend(process.env.RESEND_API_KEY ?? 'placeholder');

function hashIp(ip: string | null): string {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]!));
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // honeypot
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 너무 빠른 제출 차단 (3초)
  if (Date.now() - data.loadedAt < 3000) {
    return NextResponse.json({ error: 'too_fast' }, { status: 429 });
  }

  const userAgent = req.headers.get('user-agent') ?? '';
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null;

  // 1) Supabase 저장
  const { error: dbError } = await supabase.from('quotes').insert({
    name:          data.name,
    phone:         data.phone,
    region:        data.region || null,
    category:      data.category,
    customer_type: data.customerType || null,
    message:       data.message || null,
    source:        data.source || null,
    user_agent:    userAgent.slice(0, 200),
    ip_hash:       hashIp(ip),
  });

  if (dbError) {
    console.error('[quote] supabase insert failed', dbError);
    return NextResponse.json({ error: 'db' }, { status: 500 });
  }

  // 2) 사장님께 알림 메일
  try {
    const resend = getResend();
    await resend.emails.send({
      from: process.env.NOTIFY_FROM_EMAIL ?? 'onboarding@resend.dev',
      to:   process.env.NOTIFY_TO_EMAIL   ?? 'wnj-2023@naver.com',
      subject: `[우앤주전력] 새 견적문의 — ${data.name} (${CategoryLabels[data.category]})`,
      html: `
        <div style="font-family:Pretendard,Arial,sans-serif;font-size:14px;color:#0F172A;line-height:1.6;">
          <h2 style="margin:0 0 12px;">새 견적문의가 도착했습니다.</h2>
          <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
            <tr><td><b>이름</b></td><td>${escape(data.name)}</td></tr>
            <tr><td><b>연락처</b></td><td>${escape(data.phone)}</td></tr>
            <tr><td><b>지역</b></td><td>${escape(data.region || '-')}</td></tr>
            <tr><td><b>고객 유형</b></td><td>${data.customerType ? CustomerTypeLabels[data.customerType] : '-'}</td></tr>
            <tr><td><b>문의 유형</b></td><td>${CategoryLabels[data.category]}</td></tr>
            <tr><td valign="top"><b>상세</b></td>
                <td style="white-space:pre-wrap;">${escape(data.message || '-')}</td></tr>
            <tr><td><b>유입</b></td><td>${escape(data.source || '-')}</td></tr>
          </table>
          <p style="margin-top:16px;color:#64748B;">— 우앤주전력 웹사이트 자동알림</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('[quote] resend failed', e);
    // 메일 실패해도 DB 저장은 성공이므로 ok 처리
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
