export type ServiceCategory = 'electric' | 'panel' | 'interior';

export interface Service {
  id: ServiceCategory;
  icon: string;
  title: string;
  description: string;
  detail: string;
  points: string[];
  audiences: string[];
}

export const services: Service[] = [
  {
    id: 'electric',
    icon: 'HardHat',
    title: '전기공사',
    description: '신축·리모델링·증설 옥내외 전기공사',
    detail: '주거·상업·산업 시설의 전기 설계부터 준공까지, 전기공사업 면허 보유 업체가 직접 시공합니다.',
    points: [
      '한국전력 계약 전력 신청 및 증설',
      '옥내·옥외 배선·전선관 시공',
      '노후 배선 전면 교체 및 전기 안전 점검',
      '수변전 설비·배전반 설치·유지보수',
    ],
    audiences: ['주택', '상가', '상업건물', '공장'],
  },
  {
    id: 'panel',
    icon: 'CircuitBoard',
    title: '분전함 자체 제작',
    description: '맞춤형 분전반·배전반 직접 제작',
    detail: '외주 없이 자체 제작하므로 중간 마진이 없습니다. 현장 규격과 회로 수에 딱 맞는 분전함을 합리적인 비용으로 공급합니다.',
    points: [
      '주문형 분전반·배전반 직접 제작',
      '노후 분전함 교체 및 용량 업그레이드',
      '차단기·누전차단기 교체·추가',
      '산업용·상업용 대형 배전반도 제작 가능',
    ],
    audiences: ['주택', '상가', '상업건물', '공장'],
  },
  {
    id: 'interior',
    icon: 'Lamp',
    title: '실내 인테리어 전기',
    description: '조명 설계부터 콘센트·스위치 마감까지',
    detail: '인테리어와 어우러지는 전기 배선·조명 계획을 제안하고, 인테리어 업체 일정에 맞춰 원스톱으로 마감합니다.',
    points: [
      '카페·식당·상가 조명 계획 및 시공',
      '콘센트·스위치 위치 변경·추가·매입',
      'LED 조명 교체·설치, 레일 조명 시공',
      '인테리어 업체와 일정 직접 조율',
    ],
    audiences: ['주택', '상가'],
  },
];
