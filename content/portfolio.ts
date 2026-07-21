import { ServiceCategory } from './services';

export interface PortfolioItem {
  id: number;
  /** URL 슬러그 — /portfolio/[slug] */
  slug: string;
  title: string;
  /** 시·군·구 단위 */
  location: string;
  /** 광역 단위 — 지역 키워드 노출용 */
  region: string;
  facility: string;
  category: ServiceCategory;
  categoryLabel: string;
  image: string | null;
  /**
   * 실제 시공 사진이 아닌 자리표시 이미지인지 여부.
   * true이면 화면에 '샘플' 배지가 함께 노출되어 실제 시공 사진으로 오인되지 않는다.
   * 사장님 현장 사진을 받으면 image를 교체하고 이 플래그를 지울 것.
   */
  isPlaceholder?: boolean;
  summary: string;
  /** 공사 범위 */
  scopeItems: string[];
  /** 이 공종이 현장에서 갖는 과제 — 공종 일반에 대한 설명이다 */
  challenge: string;
  /** 시공 단계 */
  work: string[];
  /**
   * 계약전력·공기·면적 등 개별 현장 수치.
   * 사장님 확인 전까지는 비워 두며, 비어 있으면 화면에 '확인 중'으로 표기된다.
   * 추측값을 채워 넣지 말 것 — 발주처가 사실로 받아들이는 정보다.
   */
  specs?: {
    contractPower?: string;
    duration?: string;
    area?: string;
  };
}

const P = '/images/portfolio';

export const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    slug: 'chilgok-factory-new-build',
    title: '공장 신축 옥내외 전기공사',
    location: '경북 칠곡',
    region: '경상북도',
    facility: '제조 공장 (신축)',
    category: 'factory',
    categoryLabel: '공장 전기',
    image: `${P}/chilgok-factory-new-build.png`,
    isPlaceholder: true,
    summary:
      '경북 칠곡 지역 공장 신축 현장의 옥내외 전기공사입니다. 인입부터 옥내 배선, 동력 결선까지 전기 공정 전반을 담당했습니다.',
    scopeItems: [
      '옥외 인입·간선 공사',
      '옥내 배선·전선관 공사',
      '동력설비 전원 배선·결선',
      '조명·콘센트 회로 구성',
      '분전반 설치 및 회로 구성',
    ],
    challenge:
      '공장 신축 전기공사는 건축 공정과 맞물려 진행되기 때문에 골조가 올라가기 전에 배선 경로와 매입 위치를 확정해야 합니다. 마감 이후에는 경로 변경 비용이 크게 늘어나므로, 설계 검토 단계에서 향후 설비 증설 여지까지 감안해 여유 회로와 배관 경로를 잡아두는 것이 중요합니다.',
    work: [
      '건축 도면과 설비 배치 검토 후 전기 배선 경로 확정',
      '골조 공정에 맞춘 전선관·박스 매입 시공',
      '간선 포설 및 분전반 설치·회로 구성',
      '동력설비 전원 인출 및 결선',
      '절연저항·접지 확인 후 통전 시험',
    ],
  },
  {
    id: 2,
    slug: 'dalseong-production-line-power',
    title: '공장 생산라인 증설 동력설비 공사',
    location: '대구 달성',
    region: '대구광역시',
    facility: '제조 공장 (증설)',
    category: 'factory',
    categoryLabel: '공장 전기',
    image: `${P}/dalseong-production-power.png`,
    isPlaceholder: true,
    summary:
      '대구 달성 지역 공장의 생산라인 증설에 따른 동력설비 전원 공사입니다. 가동 중인 라인에 영향을 최소화하며 진행했습니다.',
    scopeItems: [
      '증설 설비 부하 산정',
      '동력 전원 간선 증설',
      '생산기계·모터 전원 배선·결선',
      '기존 분전반 회로 증설',
    ],
    challenge:
      '가동 중인 공장의 증설 공사는 정전 구간과 작업 시간을 어떻게 잡느냐가 관건입니다. 기존 설비의 부하 여유를 먼저 확인하지 않고 증설하면 차단기 용량이나 간선 굵기가 부족해 재작업이 발생합니다. 라인별 정전 가능 시간대를 사전에 협의하고, 무정전으로 처리할 구간과 정전이 필요한 구간을 나눠 공정을 짜야 생산 차질을 줄일 수 있습니다.',
    work: [
      '증설 설비 사양 확인 및 부하 산정',
      '기존 수전 용량·간선 여유 검토',
      '정전 구간·작업 시간대 사전 협의',
      '동력 간선 증설 및 기계 전원 결선',
      '시운전 입회 및 상 확인',
    ],
  },
  {
    id: 3,
    slug: 'chilgok-switchboard-manufacture',
    title: '공장 분전반·배전반 설계·설치',
    location: '경북 칠곡',
    region: '경상북도',
    facility: '제조 공장',
    category: 'panel',
    categoryLabel: '배전반 설치',
    image: `${P}/chilgok-switchboard.png`,
    isPlaceholder: true,
    summary:
      '경북 칠곡 공장 현장 규격에 맞춰 배전반·분전반을 설계하고, 협력 제작소 제작을 거쳐 반입·설치·결선·시운전까지 직접 진행했습니다. 실측·설계·설치를 한 업체가 맡아 현장 조건이 곧바로 도면에 반영됩니다.',
    scopeItems: [
      '현장 부하 산정 및 반 규격 설계',
      '단선도·외형도 작성',
      '협력 제작소 제작 발주·관리',
      '현장 반입·설치·결선',
      '통전 시험 및 회로 표기',
    ],
    challenge:
      '배전반은 기성품을 쓰면 현장 회로 수나 설치 공간과 맞지 않는 경우가 많습니다. 회로가 남거나 모자라면 이후 증설 때마다 반을 다시 손봐야 합니다. 설계 단계에서 현재 부하뿐 아니라 향후 증설분까지 감안해 예비 회로와 내부 여유 공간을 확보해 두면, 나중에 반 교체 없이 차단기 추가만으로 대응할 수 있습니다.',
    work: [
      '현장 실측 및 부하 계산',
      '반 규격·단선도·외형도 설계 확정',
      '협력 제작소 제작 발주·품질 확인',
      '현장 반입·설치·간선 결선',
      '통전 시험 후 회로 명판 정리',
    ],
  },
  {
    id: 4,
    slug: 'gyeongsan-contract-power-increase',
    title: '상가 계약전력 증설·수전설비 공사',
    location: '경북 경산',
    region: '경상북도',
    facility: '근린생활시설 (상가)',
    category: 'power',
    categoryLabel: '수전·증설',
    image: `${P}/gyeongsan-power-receiving.png`,
    isPlaceholder: true,
    summary:
      '경북 경산 상가 건물의 계약전력 증설과 수전설비 공사입니다. 한국전력 신청부터 설비 시공, 사용전 점검까지 진행했습니다.',
    scopeItems: [
      '전력 부하 산정 및 필요 용량 검토',
      '한국전력 계약전력 증설 신청 대행',
      '수전설비(수전반·계량·인입) 시공',
      '간선 증설 및 분전반 조정',
    ],
    challenge:
      '계약전력 증설은 시공만의 문제가 아니라 한국전력 신청 절차와 맞물려 있습니다. 신청 용량에 따라 불입금과 설비 부담금이 달라지고, 인입 경로와 계량 위치가 확정돼야 실제 공사에 들어갈 수 있습니다. 부하를 과소 산정하면 얼마 못 가 다시 증설해야 하고, 과다 산정하면 불필요한 기본요금을 계속 부담하게 되므로 실사용 패턴에 맞춘 용량 산정이 중요합니다.',
    work: [
      '입주 업종·설비 기준 부하 산정',
      '증설 용량 결정 및 한국전력 신청',
      '인입 경로·계량 위치 협의',
      '수전설비 시공 및 간선 증설',
      '사용전 점검 대응 후 통전',
    ],
  },
  {
    id: 5,
    slug: 'dalseo-distribution-panel-replacement',
    title: '아파트 노후 분전함 교체',
    location: '대구 달서구',
    region: '대구광역시',
    facility: '공동주택 (아파트)',
    category: 'panel',
    categoryLabel: '배전반 설치',
    image: `${P}/dalseo-panel-replacement.png`,
    isPlaceholder: true,
    summary:
      '대구 달서구 아파트의 노후 분전함을 교체했습니다. 현재 사용 전력에 맞춰 회로를 재구성하고 누전차단기를 적용했습니다.',
    scopeItems: [
      '기존 분전함 상태·회로 점검',
      '사용 전력 기준 회로 재산정',
      '분전함 교체 및 차단기 적용',
      '회로 분리·표기 정리',
    ],
    challenge:
      '준공한 지 오래된 주택은 당시 사용 전력을 기준으로 분전함이 구성돼 있어, 에어컨·인덕션 같은 고용량 기기가 늘어난 지금의 사용 패턴을 감당하지 못하는 경우가 많습니다. 차단기가 자주 떨어지거나 여러 방이 한 회로에 묶여 있으면 교체를 검토할 시점입니다. 교체 시 회로를 용도별로 분리해 두면 이후 고장 구간을 찾기도 쉬워집니다.',
    work: [
      '기존 회로 구성 및 부하 확인',
      '용도별 회로 분리 계획 수립',
      '분전함 교체 및 차단기 설치',
      '회로별 통전·누전 시험',
      '회로 명판 표기 정리',
    ],
  },
  {
    id: 6,
    slug: 'junggu-cafe-interior-electrical',
    title: '카페 인테리어 전기공사',
    location: '대구 중구',
    region: '대구광역시',
    facility: '근린생활시설 (카페)',
    category: 'interior',
    categoryLabel: '인테리어 전기',
    image: `${P}/junggu-cafe-interior.png`,
    isPlaceholder: true,
    summary:
      '대구 중구 카페의 인테리어 전기공사입니다. 주방 장비 전원과 매장 조명·콘센트 회로를 인테리어 일정에 맞춰 시공했습니다.',
    scopeItems: [
      '주방 장비 전원 용량 검토',
      '조명 회로 설계·시공',
      '콘센트 위치 배치·증설',
      '간판·외부 전원 배선',
    ],
    challenge:
      '카페는 에스프레소 머신·제빙기·오븐처럼 소비 전력이 큰 장비가 좁은 주방에 모여 있어, 기존 전기 용량으로 감당되는지부터 확인해야 합니다. 오픈 후 용량이 부족한 것을 알게 되면 영업을 멈추고 증설해야 하므로 손실이 큽니다. 또한 조명·콘센트 위치는 마감 이후 변경이 어려워, 가구 배치가 확정된 뒤 배선에 들어가는 것이 안전합니다.',
    work: [
      '반입 장비 목록 기준 전력 용량 검토',
      '가구·집기 배치 확정 후 배선 위치 결정',
      '조명·콘센트 회로 구성 및 배선',
      '주방 장비 전용 회로 시공',
      '점등·통전 확인 및 마감 협의',
    ],
  },
  {
    id: 7,
    slug: 'suseong-restaurant-lighting',
    title: '식당 리모델링 조명·콘센트 시공',
    location: '대구 수성구',
    region: '대구광역시',
    facility: '근린생활시설 (식당)',
    category: 'interior',
    categoryLabel: '인테리어 전기',
    image: `${P}/suseong-restaurant-lighting.png`,
    isPlaceholder: true,
    summary:
      '대구 수성구 식당 리모델링에 따른 조명·콘센트 시공입니다. 기존 배선을 점검하고 변경된 좌석 배치에 맞춰 회로를 재구성했습니다.',
    scopeItems: [
      '기존 배선 상태 점검',
      '변경 배치에 맞춘 조명 회로 재구성',
      '콘센트 이동·증설',
      '주방 전원 회로 정리',
    ],
    challenge:
      '리모델링 현장은 신축과 달리 기존 배선을 그대로 쓸 수 있는 구간과 교체해야 하는 구간을 먼저 가려내야 합니다. 노후 배선을 그대로 두고 부하만 늘리면 발열·누전 위험이 생깁니다. 철거 단계에서 배선 상태를 확인해 두면 추가 공사 없이 일정 안에 마감할 수 있습니다.',
    work: [
      '철거 단계에서 기존 배선 상태 확인',
      '재사용 구간·교체 구간 구분',
      '변경 좌석 배치 기준 조명 회로 재구성',
      '콘센트 이동·증설 및 주방 회로 정리',
      '통전·점등 확인',
    ],
  },
  {
    id: 8,
    slug: 'dalseo-office-led-retrofit',
    title: '사무실 LED 조명 전면 교체',
    location: '대구 달서구',
    region: '대구광역시',
    facility: '업무시설 (사무실)',
    category: 'interior',
    categoryLabel: '인테리어 전기',
    image: `${P}/dalseo-office-led.png`,
    isPlaceholder: true,
    summary:
      '대구 달서구 사무실의 조명을 LED로 전면 교체했습니다. 기존 등기구를 철거하고 조도를 재검토해 배치했습니다.',
    scopeItems: [
      '기존 등기구 철거',
      '조도 검토 및 등기구 배치',
      'LED 등기구 설치·결선',
      '조명 회로·스위치 정리',
    ],
    challenge:
      'LED 교체는 등기구만 바꾸면 끝나는 것으로 보기 쉽지만, 기존 안정기 회로가 남아 있으면 깜빡임이나 고장의 원인이 됩니다. 또 기존 형광등 기준으로 배치된 등기구 수를 그대로 LED로 바꾸면 조도가 과하거나 부족해질 수 있어, 실제 사용 공간 기준으로 조도를 다시 검토하는 편이 낫습니다.',
    work: [
      '기존 등기구·안정기 회로 확인',
      '공간별 필요 조도 검토',
      '기존 등기구 철거 및 회로 정리',
      'LED 등기구 설치·결선',
      '점등 확인 및 스위치 회로 정리',
    ],
  },
];

export const getPortfolioItem = (slug: string) =>
  portfolioItems.find((item) => item.slug === slug);

export const portfolioByCategory = (category: ServiceCategory) =>
  portfolioItems.filter((item) => item.category === category);
