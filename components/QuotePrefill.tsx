'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface QuotePrefillValue {
  /** content/services.ts 의 ServiceCategory 또는 validators 의 QUOTE_CATEGORIES 값 */
  category?: string;
  customerType?: string;
  selectCategory: (category: string) => void;
  selectCustomerType: (customerType: string) => void;
}

const QuotePrefillContext = createContext<QuotePrefillValue>({
  selectCategory: () => {},
  selectCustomerType: () => {},
});

export const useQuotePrefill = () => useContext(QuotePrefillContext);

/**
 * 견적폼 프리필 상태를 담는 컨텍스트.
 *
 * 이전에는 page.tsx가 이 상태를 들고 있느라 페이지 전체가 클라이언트 컴포넌트였고,
 * 그래서 페이지별 generateMetadata를 붙일 수 없었다(멀티페이지 SEO의 걸림돌).
 * 상태를 이 프로바이더로 내리면 페이지는 서버 컴포넌트로 남을 수 있다.
 *
 * 서비스 상세 페이지처럼 진입 시점부터 공종이 정해진 화면은
 * initialCategory로 폼을 미리 채운다.
 */
export function QuotePrefillProvider({
  children,
  initialCategory,
  initialCustomerType,
}: {
  children: ReactNode;
  initialCategory?: string;
  initialCustomerType?: string;
}) {
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [customerType, setCustomerType] = useState<string | undefined>(initialCustomerType);

  const scrollToQuote = () => {
    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectCategory = useCallback((next: string) => {
    setCategory(next);
    scrollToQuote();
  }, []);

  const selectCustomerType = useCallback((next: string) => {
    setCustomerType(next);
    scrollToQuote();
  }, []);

  const value = useMemo(
    () => ({ category, customerType, selectCategory, selectCustomerType }),
    [category, customerType, selectCategory, selectCustomerType],
  );

  return (
    <QuotePrefillContext.Provider value={value}>{children}</QuotePrefillContext.Provider>
  );
}
