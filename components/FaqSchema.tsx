/**
 * FAQPage 구조화 데이터.
 *
 * 어드민에서 편집한 FAQ가 그대로 구글·네이버 리치 결과 후보가 된다.
 * 같은 FAQPage가 여러 URL에 중복 노출되면 오히려 감점이므로,
 * 정본인 /faq 페이지에서만 렌더한다.
 */
export default function FaqSchema({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (items.length === 0) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
