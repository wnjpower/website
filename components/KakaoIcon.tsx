// 카카오톡 공식 말풍선 아이콘 SVG (브랜드 가이드라인 준수)
export default function KakaoIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3C6.925 3 2.857 6.636 2.857 11.107c0 2.874 1.733 5.4 4.357 6.933l-.964 3.587 4.196-2.1c.492.069.993.107 1.554.107 5.075 0 9.143-3.636 9.143-8.107C21.143 6.636 17.075 3 12 3z" />
    </svg>
  );
}
