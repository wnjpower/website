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
    title: '주택 태양광 3kW 설치',
    location: '대구 달성군',
    category: 'solar',
    categoryLabel: '태양광',
    image: null,
  },
  {
    id: 4,
    title: '공장 태양광 50kW 설치',
    location: '경북 칠곡',
    category: 'solar',
    categoryLabel: '태양광',
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
    title: '사무실 조명·콘센트 시공',
    location: '대구 달서구',
    category: 'interior',
    categoryLabel: '인테리어 전기',
    image: null,
  },
];
