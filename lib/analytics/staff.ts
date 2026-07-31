/**
 * 내부 인원(관리자) 방문을 통계에서 제외하기 위한 표식.
 *
 * [왜 쿠키인가]
 * 공개 페이지마다 "지금 관리자로 로그인돼 있나"를 서버에 물으면 페이지뷰 한 번에
 * Supabase 왕복이 한 번씩 붙는다. 방문자 전원이 그 비용을 치르게 되므로 쓸 수 없다.
 * 대신 관리자임이 이미 확인된 시점(어드민 화면 진입)에 브라우저에 표식을 남기고,
 * 수집 API가 그 표식만 보고 버린다. 판정은 한 번, 이후는 공짜다.
 *
 * [로그인을 풀어도 유지되는 이유]
 * 사장님이 로그아웃한 채로 사이트를 둘러보는 일이 더 흔하다. 로그아웃에 표식을
 * 지우면 그 방문이 전부 통계에 섞여 제외 기능이 무의미해진다. 그래서 표식은
 * 브라우저에 남고, 필요할 때 어드민에서 직접 해제한다.
 */

export const STAFF_COOKIE = 'wnj_staff';

/** 180일. 브라우저를 바꾸거나 쿠키를 지우면 자연히 풀린다. */
const MAX_AGE = 180 * 24 * 60 * 60;

export function isStaffCookieSet(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`${STAFF_COOKIE}=1`));
}

export function setStaffCookie(): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${STAFF_COOKIE}=1; max-age=${MAX_AGE}; path=/; samesite=lax${secure}`;
}

export function clearStaffCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${STAFF_COOKIE}=; max-age=0; path=/; samesite=lax`;
}
