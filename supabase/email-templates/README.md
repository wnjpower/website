# Supabase 인증 메일 템플릿

Supabase의 인증 메일 템플릿은 **저장소가 아니라 프로젝트 설정에 저장**된다.
프로젝트를 새로 만들거나 실수로 되돌렸을 때 복구할 수 있도록 원본을 여기 둔다.

| 파일 | 대상 | 적용 위치 |
|---|---|---|
| [`recovery.html`](recovery.html) | 비밀번호 재설정 | Authentication → Email Templates → **Reset Password** |

제목: `[우앤주전력] 관리자 비밀번호 재설정`

## 이 템플릿의 핵심 — `{{ .TokenHash }}`

기본 템플릿은 `{{ .ConfirmationURL }}`을 쓰는데, 두 가지 문제가 있다.

1. **기기가 묶인다.** PKCE 검증자가 링크를 요청한 브라우저에만 있어서, PC에서
   요청하고 폰에서 열면 실패한다.
2. **대시보드에서 보낸 메일은 홈으로 떨어진다.** 되돌아올 주소로 Site URL을
   그대로 쓰기 때문에 우리 콜백 라우트를 지정할 수 없다.

`{{ .TokenHash }}`로 링크를 직접 만들면 둘 다 해결된다. 서버가
[`app/admin/auth/callback/route.ts`](../../app/admin/auth/callback/route.ts)에서
`verifyOtp`로 검증하므로 **어느 기기에서 열어도 된다.**

```
{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/admin/auth/reset-password
```

## 전제 조건 — 커스텀 SMTP

무료 tier + Supabase 기본 발송기 조합에서는 **템플릿 수정이 거부된다**
(`Email template modification is not available for free tier projects`).
이 프로젝트는 Resend를 SMTP로 연결해 풀었다.

| 항목 | 값 |
|---|---|
| Host / Port | `smtp.resend.com` / `465` |
| Username | `resend` |
| Password | `RESEND_API_KEY` (견적 알림 메일과 같은 키) |
| 발신 주소 | `quote@wnjpower.com` (Resend에서 배달이 검증된 주소) |
| 표시 이름 | 우앤주전력 |

기본 발송기의 **시간당 2통** 제한도 이때 30통으로 올렸다. 2통 제한이 걸려 있으면
재설정을 두어 번 재시도하는 것만으로 그 시간 동안 메일이 오지 않는다.

## 되돌리는 법

Management API로 적용한다(대시보드에서 붙여넣어도 된다).

```
PATCH https://api.supabase.com/v1/projects/{ref}/config/auth
{
  "mailer_subjects_recovery": "[우앤주전력] 관리자 비밀번호 재설정",
  "mailer_templates_recovery_content": "<recovery.html 내용>"
}
```
