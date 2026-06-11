export type ServiceCategory = 'electric' | 'solar' | 'interior';

export interface Service {
  id: ServiceCategory;
  icon: string;
  title: string;
  description: string;
  detail: string;
  audiences: string[];
}

export const services: Service[] = [
  {
    id: 'electric',
    icon: 'HardHat',
    title: '전기공사',
    description: '신축/리모델링 옥내외 전기공사',
    detail: '주거·상업·산업 시설의 전기 설계부터 시공까지. 전기공사업 면허 보유.',
    audiences: ['주택', '상가', '상업건물'],
  },
  {
    id: 'solar',
    icon: 'Sun',
    title: '태양광 발전설비',
    description: '신재생에너지 (자가소비/판매)',
    detail: '주택·건물 옥상 태양광 발전 시스템 설계·시공. 정부 보조금 안내 병행.',
    audiences: ['주택', '상업건물'],
  },
  {
    id: 'interior',
    icon: 'Lamp',
    title: '실내 인테리어 전기',
    description: '카페·상가·주택 조명·콘센트 설계 시공',
    detail: '인테리어와 어우러지는 전기 배선·조명 설계. 원스톱 마감 처리.',
    audiences: ['주택', '상가'],
  },
];
