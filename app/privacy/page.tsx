import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 우앤주전력',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 sm:p-12">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">개인정보처리방침</h1>

        <div className="prose prose-sm text-gray-600 space-y-6">
          <section>
            <h2 className="text-base font-bold text-[#0F172A]">1. 개인정보의 수집·이용 목적</h2>
            <p>주식회사 우앤주전력(이하 &ldquo;회사&rdquo;)은 견적 문의 응대 및 서비스 안내를 목적으로 개인정보를 수집합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#0F172A]">2. 수집하는 개인정보 항목</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>필수: 이름, 연락처, 문의 유형</li>
              <li>선택: 지역, 상세 내용</li>
              <li>자동 수집: IP 주소(해시 처리), 브라우저 정보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#0F172A]">3. 개인정보의 보유·이용 기간</h2>
            <p>수집일로부터 3년. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간까지 보관합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#0F172A]">4. 개인정보의 제3자 제공</h2>
            <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법률에 특별한 규정이 있는 경우는 예외로 합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#0F172A]">5. 개인정보 처리 담당자</h2>
            <ul className="list-none space-y-1">
              <li>담당자: 임태훈 (대표)</li>
              <li>이메일: wnj-2023@naver.com</li>
              <li>전화: 053-525-0424</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#0F172A]">6. 정보주체의 권리</h2>
            <p>이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 담당자 이메일로 문의해 주세요.</p>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t">시행일: 2025년 1월 1일</p>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-brand font-semibold hover:underline">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
