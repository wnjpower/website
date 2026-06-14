import { ServiceCategory } from './services';

export interface PortfolioItem {
  id: number;
  title: string;
  location: string;
  category: ServiceCategory;
  categoryLabel: string;
  image: string | null;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: '신축 단독주택 전기공사',
    location: '대구 서구',
    category: 'electric',
    categoryLabel: '전기공사',
    image: null,
  },
  {
    id: 2,
    title: '상가 리모델링 전기공사',
    location: '대구 북구',
    category: 'electric',
    categoryLabel: '전기공사',
    image: null,
  },
  {
    id: 3,
    title: '빌라 단지 전기 계약 전력 증설',
    location: '경북 경산',
    category: 'electric',
    categoryLabel: '전기공사',
    image: null,
  },
  {
    id: 4,
    title: '공장 분전반·배전반 자체 제작 납품',
    location: '경북 칠곡',
    category: 'panel',
    categoryLabel: '분전함 제작',
    image: null,
  },
  {
    id: 5,
    title: '아파트 노후 분전함 교체',
    location: '대구 달서구',
    category: 'panel',
    categoryLabel: '분전함 제작',
    image: null,
  },
  {
    id: 6,
    title: '카페 인테리어 전기공사',
    location: '대구 중구',
    category: 'interior',
    categoryLabel: '인테리어 전기',
    image: null,
  },
  {
    id: 7,
    title: '식당 리모델링 조명·콘센트 시공',
    location: '대구 수성구',
    category: 'interior',
    categoryLabel: '인테리어 전기',
    image: null,
  },
  {
    id: 8,
    title: '사무실 LED 조명 전면 교체',
    location: '대구 달서구',
    category: 'interior',
    categoryLabel: '인테리어 전기',
    image: null,
  },
];
