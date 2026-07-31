/**
 * 내부 인원(관리자) 방문을 통계에서 제외하기 위한 표식.
 *
 * [왜 쿠키인가]
 * 공개 페이지마다 "지금 관리자로 로그인돼 있나"를 서버에 물으면 페이지뷰 한 번에
 * Supabase 왕복이 한 번씩 붙는다. 방문자 전원이 그 비용을 치르게 되므로 쓸 수 없다.
 * 대신 관리자임이 확인된 시점(어드민 진입)에 표식을 남기고, 이후에는 그 표식만 본다.
 *
 * [왜 서버(미들웨어)가 심는가]
 * 처음에는 어드민 화면의 useEffect로 심었는데, 화면이 실제로 렌더된 뒤에야 설정되어
 * 새로고침 순서·탭 상태에 따라 누락됐다. 미들웨어는 어드민 요청이 지나가는 길목이라
 * 화면이 그려지든 말든(리다이렉트 포함) 확실히 심을 수 있다.
 *
 * [값이 '1'/'0' 두 가지인 이유]
 * 미들웨어가 어드민 방문 때마다 무조건 '1'로 덮으면, 사장님이 "내 방문도 집계하기"를
 * 켜도 다음 어드민 방문에 원상복구된다. 그래서 명시적 해제는 '0'으로 남기고,
 * 미들웨어는 쿠키가 아예 없을 때만 '1'을 심는다.
 */

export const STAFF_COOKIE = 'wnj_staff';

/** 제외 대상 */
export const STAFF_EXCLUDED = '1';
/** 관리자지만 집계에 포함하기로 직접 선택한 상태 */
export const STAFF_INCLUDED = '0';

/** 180일. 브라우저를 바꾸거나 쿠키를 지우면 자연히 풀린다. */
export const STAFF_MAX_AGE = 180 * 24 * 60 * 60;

function readCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${STAFF_COOKIE}=`));
  return hit ? hit.slice(STAFF_COOKIE.length + 1) : null;
}

/** 지금 이 브라우저의 방문이 통계에서 빠지는가. */
export function isStaffExcluded(): boolean {
  return readCookie() === STAFF_EXCLUDED;
}

function write(value: string): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie =
    `${STAFF_COOKIE}=${value}; max-age=${STAFF_MAX_AGE}; path=/; samesite=lax${secure}`;
}

export function excludeMyVisits(): void {
  write(STAFF_EXCLUDED);
}

/** 집계에 포함시킨다. 미들웨어가 다시 덮지 않도록 '0'을 남긴다(지우지 않는다). */
export function includeMyVisits(): void {
  write(STAFF_INCLUDED);
}
