import { faqs } from '@/content/faq';

/**
 * FAQPage 구조화 데이터.
 *
 * 이미 작성돼 있는 FAQ 14건을 그대로 활용하는 것만으로 구글 리치 결과 후보가 된다.
 * 콘텐츠를 새로 쓸 필요가 없어 투입 대비 효과가 큰 항목.
 */
export default function FaqSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
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
