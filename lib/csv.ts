/**
 * CSV 만들기.
 *
 * 구글 시트·엑셀에 그대로 올릴 수 있는 파일을 만든다. 한국어 데이터라
 * 그냥 쉼표로 이으면 세 가지가 깨진다.
 *
 *  1) **글자 깨짐** — 엑셀은 BOM이 없으면 UTF-8 CSV를 시스템 인코딩(한국어
 *     윈도우에서는 CP949)으로 읽어 전부 «????»가 된다. 구글 시트는 BOM이
 *     없어도 되지만 있어도 무해하므로 항상 붙인다.
 *  2) **줄·칸 어긋남** — 값 안에 쉼표·따옴표·줄바꿈이 있으면 칸이 밀린다.
 *     RFC 4180대로 따옴표로 감싸고 내부 따옴표는 두 번 쓴다.
 *  3) **수식 주입(CSV injection)** — 아래 escapeFormula 주석 참조.
 */

/**
 * 수식으로 해석될 수 있는 값을 막는다.
 *
 * 구글 시트·엑셀은 `=`, `+`, `-`, `@`, 탭, 캐리지리턴으로 시작하는 칸을
 * **수식으로 실행한다.** 이 파일이 내보내는 «인용된 대목»과 «메모»는
 * 답변엔진의 답을 그대로 붙여넣은 값이다. 즉 우리가 통제하지 않는 글이
 * 남의 스프레드시트에서 실행될 수 있다는 뜻이다
 * (`=HYPERLINK(...)`, `=IMPORTXML(...)` 같은 것으로 데이터가 새어 나간다).
 *
 * 앞에 작은따옴표를 붙이면 시트가 «글자»로 읽는다. 화면에는 따옴표가
 * 보이지 않는다.
 */
function escapeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function cell(value: unknown): string {
  if (value === null || value === undefined) return '';

  let text: string;
  if (value instanceof Date) text = value.toISOString();
  else if (typeof value === 'boolean') text = value ? 'Y' : 'N';
  else text = String(value);

  text = escapeFormula(text);

  // 쉼표·따옴표·줄바꿈이 있으면 감싼다. 내부 따옴표는 두 번.
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * 행 배열을 CSV 문자열로. 첫 줄은 머리글이다.
 *
 * 줄바꿈은 CRLF — RFC 4180이 그렇게 정하고 있고, 윈도우 엑셀에서 LF만 쓰면
 * 일부 버전이 한 줄로 읽는다.
 */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))];
  return `﻿${lines.join('\r\n')}\r\n`;
}

/**
 * 파일 이름을 Content-Disposition 헤더로.
 *
 * 파일명에 한글이 들어가므로 `filename=`만 쓰면 브라우저마다 깨진다.
 * RFC 5987의 `filename*`(UTF-8 퍼센트 인코딩)을 함께 보내고, 그것을 모르는
 * 옛 브라우저를 위해 ASCII 대체 이름도 남긴다.
 */
export function contentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/** `2026-08-09` — 파일 이름과 «기준일» 칸에 쓴다(한국 시간 기준). */
export function todayInSeoul(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** `2026-08-09 18:30` — 관찰 시각처럼 시분까지 필요한 칸에 쓴다. */
export function formatSeoul(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}
