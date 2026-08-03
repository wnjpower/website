/**
 * 도면 정합 마크 네 개. `.blueprint` 를 쓴 요소의 첫 자식으로 넣는다.
 *
 * Chrome.tsx가 아니라 별도 파일에 두는 이유 — 헤더(클라이언트 컴포넌트)가
 * 이걸 쓰는데, Chrome.tsx에서 가져오면 Chrome ↔ HeaderBar 순환 참조가 된다.
 * Chrome.tsx는 기존 import 경로를 유지하려고 이 파일을 그대로 재수출한다.
 */
export function CornerMarks() {
  return (
    <>
      <i className="corner tl" aria-hidden />
      <i className="corner tr" aria-hidden />
      <i className="corner bl" aria-hidden />
      <i className="corner br" aria-hidden />
    </>
  );
}
