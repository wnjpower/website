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
    title: '공장 신축 옥내외 전기공사',
    location: '경북 칠곡',
    category: 'factory',
    categoryLabel: '공장 전기',
    image: null,
  },
  {
    id: 2,
    title: '공장 생산라인 증설 동력설비 공사',
    location: '대구 달성',
    category: 'factory',
    categoryLabel: '공장 전기',
    image: null,
  },
  {
    id: 3,
    title: '공장 분전반·배전반 자체 제작 납품',
    location: '경북 칠곡',
    category: 'panel',
    categoryLabel: '배전반 제작',
    image: null,
  },
  {
    id: 4,
    title: '상가 계약전력 증설·수전설비 공사',
    location: '경북 경산',
    category: 'power',
    categoryLabel: '수전·증설',
    image: null,
  },
  {
    id: 5,
    title: '아파트 노후 분전함 교체',
    location: '대구 달서구',
    category: 'panel',
    categoryLabel: '배전반 제작',
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
