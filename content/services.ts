export type ServiceCategory = 'factory' | 'power' | 'panel' | 'interior';

export interface Service {
  id: ServiceCategory;
  icon: string;
  title: string;
  description: string;
  detail: string;
  points: string[];
  audiences: string[];
  tier: 'primary' | 'secondary';
}

export const services: Service[] = [
  {
    id: 'factory',
    icon: 'Factory',
    title: '공장·산업 전기공사',
    description: '공장 신축·증축·증설 옥내외 전기공사',
    detail: '대구·경북 공장·산업시설의 신축·증축·증설 전기공사를 설계 검토부터 준공까지 직접 시공합니다. 전기공사업 면허 보유 법인이 책임집니다.',
    points: [
      '공장 신축·증축 옥내외 배선·전선관 공사',
      '동력설비(모터·생산기계) 전원 배선·결선',
      '생산라인 증설에 따른 전기 증설 공사',
      '옥외 전주·인입·간선 공사',
    ],
    audiences: ['공장', '산업시설', '물류센터', '제조라인'],
    tier: 'primary',
  },
  {
    id: 'power',
    icon: 'Gauge',
    title: '수전설비·계약전력 증설',
    description: '수전반·계량·인입, 계약전력 증설',
    detail: '한국전력 계약전력 증설부터 수전설비(수전반·계량·인입) 시공까지. 현장 전력 수요에 맞춰 안전하게 용량을 확보합니다.',
    points: [
      '한국전력 계약전력 신청·증설 대행',
      '수전설비(수전반·계량기·인입선) 공사',
      '저압·동력 전기 용량 산정 및 증설',
      '전력 인입 경로 설계·시공',
    ],
    audiences: ['공장', '상업건물', '상가', '병원'],
    tier: 'primary',
  },
  {
    id: 'panel',
    icon: 'CircuitBoard',
    title: '배전반·분전반 설계·설치',
    description: '현장 맞춤 배전반·분전반 설계·설치',
    detail: '현장 규격·회로 수에 맞춰 직접 설계하고, 제작은 협력 제작소, 반입·설치·결선·시운전은 직접 진행합니다. 설계한 업체가 설치까지 맡아 책임 소재가 나뉘지 않습니다.',
    points: [
      '현장 맞춤 배전반·분전반 설계 (단선도·외형도)',
      '협력 제작 후 반입·설치·결선·시운전 직접',
      '노후 분전반 교체·용량 업그레이드',
      '차단기·누전차단기 교체·증설',
    ],
    audiences: ['공장', '상업건물', '상가', '주택'],
    tier: 'primary',
  },
  {
    id: 'interior',
    icon: 'Lamp',
    title: '인테리어·일반 전기',
    description: '주택·아파트·상가·병원 인테리어 전기',
    detail: '인테리어 일정에 맞춰 조명·콘센트·배선을 원스톱으로 마감합니다. 주택·아파트·상가·병원 등 일반 전기공사도 함께 진행합니다.',
    points: [
      '카페·식당·상가·병원 인테리어 전기',
      '아파트·주택 조명·콘센트·스위치 시공',
      '노후 배선 교체 및 전기 안전 점검',
      '인테리어 업체와 일정 직접 조율',
    ],
    audiences: ['주택', '아파트', '상가', '병원'],
    tier: 'secondary',
  },
];
