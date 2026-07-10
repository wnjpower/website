import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { Resend } from 'resend';
import { QuoteSchema, CategoryLabels, CustomerTypeLabels } from '@/lib/validators';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendAlimtalk } from '@/lib/kakao-alimtalk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? 'placeholder');

function hashIp(ip: string | null): string {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

function buildEmailHtml(data: {
  companyName?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  region?: string | null;
  customerType?: string | null;
  category: string;
  categoryLabel: string;
  customerTypeLabel: string;
  message?: string | null;
  timestamp: string;
}): string {
  const row = (label: string, value: string, highlight = false) => `
    <tr>
      <td width="110" style="padding:10px 12px;font-size:13px;font-weight:bold;color:#475569;background:#F8FAFC;border-bottom:1px solid #E2E8F0;vertical-align:top;white-space:nowrap;">
        ${label}
      </td>
      <td style="padding:10px 14px;font-size:13px;color:${highlight ? '#0A3D91' : '#0F172A'};font-weight:${highlight ? 'bold' : 'normal'};background:#ffffff;border-bottom:1px solid #E2E8F0;">
        ${value}
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EFF3F8;font-family:Arial,'Malgun Gothic',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF3F8;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

  <!-- ① 헤더 배너 -->
  <tr>
    <td style="background:#0A3D91;padding:32px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.35);border-radius:20px;padding:5px 16px;margin-bottom:14px;">
        <span style="color:#FFD700;font-size:13px;font-weight:bold;letter-spacing:1px;">🔔 새 견적문의가 접수되었습니다</span>
      </div>
      <div style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:-0.5px;">주식회사 우앤주전력</div>
      <div style="color:rgba(255,255,255,0.65);font-size:13px;margin-top:6px;">wnjpower.com · 견적문의 자동 알림</div>
    </td>
  </tr>

  <!-- ② 긴급 알림 띠 -->
  <tr>
    <td style="background:#FFF7ED;border-left:4px solid #FF5500;padding:14px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="display:inline-block;background:#FF5500;color:#ffffff;font-size:11px;font-weight:bold;padding:3px 10px;border-radius:4px;letter-spacing:0.5px;">견적요청</span>
            <span style="color:#92400E;font-size:14px;font-weight:bold;margin-left:10px;">빠른 연락을 부탁드립니다</span>
          </td>
          <td align="right" style="color:#B45309;font-size:12px;white-space:nowrap;">${escape(data.timestamp)}</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ③ 공사 종류 하이라이트 -->
  <tr>
    <td style="padding:24px 24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0A3D91,#1E5CB3);border-radius:8px;">
        <tr>
          <td style="padding:18px 20px;">
            <div style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:bold;letter-spacing:1.5px;margin-bottom:6px;">요청 공사 종류</div>
            <div style="color:#ffffff;font-size:18px;font-weight:bold;">${escape(data.categoryLabel)}</div>
            ${data.customerTypeLabel ? `<div style="display:inline-block;background:rgba(255,255,255,0.18);color:#ffffff;font-size:12px;padding:3px 10px;border-radius:12px;margin-top:8px;">${escape(data.customerTypeLabel)}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ④ 고객 연락처 -->
  <tr>
    <td style="padding:20px 24px 0;">
      <div style="font-size:11px;font-weight:bold;color:#0A3D91;letter-spacing:1.5px;margin-bottom:8px;">▸ 고객 연락처</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
        ${data.companyName ? row('업체명', escape(data.companyName)) : ''}
        ${row('성함', escape(data.name), true)}
        ${row('연락처', `<a href="tel:${escape(data.phone)}" style="color:#0A3D91;font-weight:bold;text-decoration:none;font-size:15px;">📞 ${escape(data.phone)}</a>`, false)}
        ${data.email ? row('이메일', `<a href="mailto:${escape(data.email)}" style="color:#0A3D91;text-decoration:none;">${escape(data.email)}</a>`) : ''}
        ${data.region ? row('시공 지역', escape(data.region)) : ''}
      </table>
    </td>
  </tr>

  <!-- ⑤ 요청 상세 내용 -->
  ${data.message ? `
  <tr>
    <td style="padding:20px 24px 0;">
      <div style="font-size:11px;font-weight:bold;color:#0A3D91;letter-spacing:1.5px;margin-bottom:8px;">▸ 상세 내용</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:14px 16px;font-size:13px;color:#334155;line-height:1.7;white-space:pre-wrap;">${escape(data.message)}</td>
        </tr>
      </table>
    </td>
  </tr>` : ''}

  <!-- ⑥ 전화 CTA 버튼 -->
  <tr>
    <td style="padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="tel:${escape(data.phone)}"
               style="display:inline-block;background:#FF5500;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:16px 40px;border-radius:8px;letter-spacing:0.3px;">
              📞 &nbsp;${escape(data.phone)}&nbsp; 지금 바로 전화하기
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:10px;font-size:12px;color:#94A3B8;">
            버튼을 누르면 고객에게 바로 전화가 연결됩니다
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ⑦ 푸터 -->
  <tr>
    <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 24px;text-align:center;">
      <div style="font-size:13px;font-weight:bold;color:#0F172A;margin-bottom:4px;">주식회사 우앤주전력</div>
      <div style="font-size:12px;color:#64748B;line-height:1.8;">
        대구광역시 서구 문화로63길 19, 1층 (평리동)<br>
        사업자등록번호: 637-81-02833 · 전기공사업 면허: 대구-01425<br>
        대표: 053-525-0424 · 모바일: 010-8552-9994
      </div>
      <div style="margin-top:12px;font-size:11px;color:#94A3B8;">
        이 메일은 <a href="https://wnjpower.com" style="color:#0A3D91;text-decoration:none;">wnjpower.com</a> 견적문의 폼에서 자동 발송된 알림입니다.
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
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

  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (Date.now() - data.loadedAt < 3000) {
    return NextResponse.json({ error: 'too_fast' }, { status: 429 });
  }

  const userAgent = req.headers.get('user-agent') ?? '';
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null;

  // 1) Supabase 저장 (신규 계정 재설정 전까지는 미설정 상태 — 있으면 시도, 없거나 실패해도 이메일/알림톡은 계속 진행)
  if (isSupabaseConfigured) {
    try {
      const { error: dbError } = await supabase.from('quotes').insert({
        company_name:  data.companyName || null,
        name:          data.name,
        phone:         data.phone,
        email:         data.email || null,
        region:        data.region || null,
        category:      data.category,
        customer_type: data.customerType || null,
        message:       data.message || null,
        source:        data.source || null,
        user_agent:    userAgent.slice(0, 200),
        ip_hash:       hashIp(ip),
      });
      if (dbError) console.error('[quote] supabase insert failed', dbError);
    } catch (e) {
      console.error('[quote] supabase insert threw', e);
    }
  } else {
    console.warn('[quote] Supabase 미설정 — DB 저장 생략, 이메일/알림톡만 발송');
  }

  // 2) 알림 메일 + 알림톡 공용 메타
  const categoryLabel    = CategoryLabels[data.category];
  const customerTypeLabel = data.customerType ? CustomerTypeLabels[data.customerType] : '';
  const timestamp = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  try {
    const resend = getResend();
    await resend.emails.send({
      from:    process.env.NOTIFY_FROM_EMAIL ?? 'onboarding@resend.dev',
      to:      process.env.NOTIFY_TO_EMAIL   ?? 'wnj-2023@naver.com',
      subject: `[견적요청] ${data.name}${data.companyName ? ` (${data.companyName})` : ''} — ${categoryLabel}`,
      html: buildEmailHtml({
        companyName:       data.companyName || null,
        name:              data.name,
        phone:             data.phone,
        email:             data.email || null,
        region:            data.region || null,
        customerType:      data.customerType || null,
        category:          data.category,
        categoryLabel,
        customerTypeLabel,
        message:           data.message || null,
        timestamp,
      }),
    });
  } catch (e) {
    console.error('[quote] resend failed', e);
  }

  // 3) 카카오 알림톡 (SOLAPI_* 환경변수 세팅 후 자동 활성화)
  const alimtalkSent = await sendAlimtalk({
    requesterPhone: data.phone,
    requesterName:  data.name,
    companyName:    data.companyName || undefined,
    categoryLabel,
    region:         data.region     || undefined,
    timestamp,
  }).catch(() => false);

  return NextResponse.json({ ok: true, alimtalkSent }, { status: 200 });
}
