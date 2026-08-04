/**
 * 페이지 머리 — 사이트의 SectionHead와 같은 형태(번호 + 제목 + 보조 설명, 좌측 정렬).
 *
 * 번호는 사이드 레일의 메뉴 번호와 같은 값이다. 지금 어느 메뉴에 있는지가
 * 본문에서도 한 번 더 확인된다.
 */
export default function PageHeader({
  no,
  title,
  description,
  action,
}: {
  no?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="a-pagehead">
      {no && <span className="a-pageno">{no}</span>}
      <h1>{title}</h1>
      {description && (
        <p className="text-muted flex-1 min-w-[220px] break-keep" style={{ fontSize: 13 }}>
          {description}
        </p>
      )}
      {action && <span className="ml-auto flex-shrink-0">{action}</span>}
    </div>
  );
}
