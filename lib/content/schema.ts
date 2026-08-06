import { COMPANY } from '@/lib/site';

/**
 * 사이트 콘텐츠의 단일 정의 파일.
 *
 * 여기 한 곳이 세 가지를 동시에 결정한다.
 *   1) 기본값 (CONTENT_DEFAULTS) — DB가 비어 있어도 사이트는 완전히 동작한다
 *   2) 타입      (SiteContent)   — 기본값에서 자동 추론되므로 따로 관리할 게 없다
 *   3) 어드민 폼 (SECTION_DEFS)  — 사장님이 보는 편집 화면이 이 정의로 자동 생성된다
 *
 * 새 문구를 편집 가능하게 만들려면 기본값에 키를 넣고 SECTION_DEFS에 필드
 * 한 줄을 추가하면 끝이다. 어드민 화면 코드는 건드릴 필요가 없다.
 */

// ─────────────────────────────────────────────
//  기본값 — 현재 사이트에 실제로 쓰이는 카피
// ─────────────────────────────────────────────
export const CONTENT_DEFAULTS = {
  /** 상단 공지 배너 — 기본은 꺼짐. 이벤트·휴무 안내 등에 쓴다 */
  banner: {
    enabled: false,
    text: '설 연휴 기간에도 긴급 A/S는 정상 접수합니다.',
    linkLabel: '',
    linkHref: '',
  },

  /*
   * 상단 유틸리티 띠(topBar*)와 로고 아래 한 줄(logoSub)이 여기 있었다.
   * 1b 블루프린트는 헤더를 한 줄로 눌러 띠를 없앴고, 로고는 심볼 + 한글 상호로 끝난다.
   * 편집 화면에서 뺀 뒤에도 기본값에는 남아 «고쳐도 화면이 그대로인 값»이었다.
   * 저장돼 있던 값도 DB에서 지웠으므로(migrations/20260805) 기본값에서도 걷어낸다.
   */
  header: {
    logoText: '우앤주전력',
    nav: [
      { label: '사업영역', href: '/#services' },
      { label: '비용안내', href: '/#pricing' },
      { label: '시공실적', href: '/portfolio' },
      { label: '회사소개', href: '/about' },
      { label: '자주묻는질문', href: '/faq' },
    ],
    showBlogLink: false,
  },

  hero: {
    eyebrow: `대구·경북 공장·산업 전기공사 — 등록번호 ${COMPANY.license}`,
    title: '도면에서 준공까지,\n한 팀이 직접 시공합니다',
    /**
     * 답변엔진(AI 검색)이 그대로 인용할 수 있는 정의문 한 문장으로 시작한다 — 스펙 §7-3.
     * "무엇을 하는 회사인가"가 첫 문장에서 끝나야 인용 대상이 된다.
     */
    lead: '주식회사 우앤주전력은 전기공사업 등록 법인으로, 공장 신축·증축, 수전설비·계약전력 증설, 배전반 설계·설치를 하도급 없이 직접 수행합니다.',
    leadHighlight: '전기공사업 등록 법인',
    note: '현장 방문 견적 무료 · 출장비 없음 · 1영업일 내 회신',
    backgroundImage: '',
    /**
     * 신뢰 지표 4칸. label이 크게, sub가 그 아래 설명으로 나온다.
     * 형용사가 아니라 조회 가능한 번호·기간을 넣는 것이 이 자리의 원칙이다.
     *
     * 1b 재구축 전에는 이 자리가 «부문 바로가기» 두 칸(segments)이었다. 부문 진입은
     * 바로 아래 사업영역 카드가 이미 맡고 있어 중복이었고, 그 필드는 이제 없앴다.
     */
    trustStats: [
      { icon: 'ShieldCheck',   label: COMPANY.license, sub: '전기공사업 등록번호',            mono: true  },
      { icon: 'CalendarClock', label: '20년+',         sub: '대표 현장경력 · 2023 법인 설립', mono: false },
      { icon: 'Layers',        label: '직접 시공',      sub: '하도급 없음 · 설계 검토→준공',   mono: false },
      { icon: 'Wrench',        label: '당일 출동',      sub: 'A/S · 준공 후 1년 보증',        mono: false },
    ],
  },

  /**
   * 히어로 직하 퀵폼 — 본 견적폼(입력 9개)이 부담스러운 이탈층을 회수한다.
   * 연락처만 필수라 30초면 접수된다. 접수는 /api/quote를 그대로 타고
   * source='quick_bar'로 구분되어, 어드민 실시간 현황에서 본폼과 전환율을 비교할 수 있다.
   */
  quickForm: {
    enabled: true,
    title: '빠른 견적 접수',
    note: '1영업일 내 담당자가 직접 연락드립니다',
    consentNote: '접수 시 연락처 수집·이용(보유 1년)에 동의한 것으로 봅니다',
    successTitle: '접수되었습니다 — 1영업일 내 연락드립니다',
    successNote: '급하시면 010-8552-9994로 바로 전화 주세요.',
  },

  /*
   * 여기서부터 각 섹션에 있던 '작은 머리말'(eyebrow)을 걷어냈다.
   * 1b 블루프린트의 섹션 머리는 «번호 + 제목 + 보조 설명»(SectionHead)이라
   * 머리말이 들어갈 자리가 없다. 히어로만 예외로 eyebrow를 계속 렌더한다.
   */
  services: {
    title: '3대 전문 분야',
    lead: '공장·산업 전기공사를 주력으로, 인테리어 전기와 배전반 설계·설치까지 직접 시공합니다. 계약전력 증설·수전설비는 공장 전기공사와 함께 진행합니다.',
    /**
     * id는 /services/{id} 경로와 견적폼 카테고리에 연결돼 있어 어드민에서 바꾸지 않는다.
     * 문구(title·detail·points·audiences·tier)만 편집 대상이다.
     */
    items: [
      {
        id: 'factory',
        title: '공장·산업 전기공사',
        detail: '대구·경북 공장·산업시설의 신축·증축·증설 전기공사를 설계 검토부터 준공까지 직접 시공합니다. 전기공사업 면허 보유 법인이 책임집니다.',
        points: [
          '공장 신축·증축 옥내외 배선·전선관 공사',
          '동력설비(모터·생산기계) 전원 배선·결선',
          '생산라인 증설에 따른 전기 증설 공사',
          '계약전력 증설·수전설비(수전반·계량·인입) 연계 시공',
          '옥외 전주·인입·간선 공사',
        ],
        audiences: ['공장', '산업시설', '물류센터', '제조라인'],
        tier: 'primary',
      },
      {
        id: 'interior',
        title: '인테리어·일반 전기',
        detail: '인테리어 일정에 맞춰 조명·콘센트·배선을 원스톱으로 마감합니다. 주택·아파트·상가·병원 등 일반 전기공사도 함께 진행합니다.',
        points: [
          '카페·식당·상가·병원 인테리어 전기',
          '아파트·주택 조명·콘센트·스위치 시공',
          '노후 배선 교체 및 전기 안전 점검',
          '인테리어 업체와 일정 직접 조율',
        ],
        audiences: ['주택', '아파트', '상가', '병원'],
        tier: 'primary',
      },
      {
        id: 'panel',
        title: '배전반·분전반 설계·설치',
        detail: '현장 규격·회로 수에 맞춰 직접 설계하고, 제작은 협력 제작소, 반입·설치·결선·시운전은 직접 진행합니다. 설계한 업체가 설치까지 맡아 책임 소재가 나뉘지 않습니다.',
        points: [
          '현장 맞춤 배전반·분전반 설계 (단선도·외형도)',
          '협력 제작 후 반입·설치·결선·시운전 직접',
          '노후 분전반 교체·용량 업그레이드',
          '차단기·누전차단기 교체·증설',
        ],
        audiences: ['공장', '상업건물', '상가', '주택'],
        tier: 'secondary',
      },
    ],
  },

  /**
   * 자격 — "믿을 수 있나"에 답하는 다크 필드.
   *
   * 1b 재구축에서 기존 '차별점 4가지'(reasons)와 그 머리말(verifyTitle)은 뺐다.
   * 같은 주장이 히어로 신뢰 지표와 사업영역 카드에 이미 두 번 나와 세 번째
   * 반복이었기 때문이다(P3). 이 자리는 조회 가능한 등록번호 3종과 회사 개요
   * 사실 표만 담당한다. 기본값에 남겨 두었던 두 필드도 이제 걷어냈다 —
   * DB에 저장된 whyus 값이 없어 잃는 데이터가 없다.
   */
  whyus: {
    title: '검증 가능한 자격',
    lead: '말이 아니라 공공기관 조회로 확인하세요',
    corpNote: '2023년 3월 법인 설립 · 대표 현장경력 20년+ · 계약 시 면허증 사본 제공',
    /** 회사 개요 사실 표 — LocalBusiness JSON-LD와 1:1로 맞춘다 (스펙 §7-2) */
    industry: '전기공사업 (공장·산업 전기 전문)',
  },

  process: {
    title: '문의부터 사후관리까지, 4단계',
    lead: '각 단계에 걸리는 기간을 미리 알려드립니다.',
    steps: [
      { step: '01', title: '문의 접수',      duration: '즉시 ~ 1영업일',   description: '전화·견적폼 중 편한 방법으로 문의 주세요. 접수 후 담당자가 확인해 연락드립니다.' },
      { step: '02', title: '현장 실사·견적', duration: '요청일 협의',       description: '전문가가 직접 현장을 방문해 정확한 견적을 무료로 드립니다. 출장비는 없습니다.' },
      { step: '03', title: '시공',           duration: '규모별 1일 ~ 2주', description: '면허 보유 인력이 안전하고 깔끔하게 시공합니다. 일정은 견적 시 확정됩니다.' },
      { step: '04', title: '사후관리·A/S',   duration: '준공 후 1년 보증', description: '대구·경북 당일 출동 원칙으로 준공 이후까지 책임지고 관리합니다.' },
    ],
  },

  /**
   * 비용 — "얼마인가"에 답할 수 없으면 "무엇이 금액을 정하는가"에 답한다.
   *
   * 기존 '표준 작업 항목표'는 비용 열이 전부 "협의 후 견적"이라 정보가 0이었다(P6).
   * 변수 3개를 먼저 공개하고, 표는 항목별 '산정 기준'을 밝히는 쪽으로 바꿨다.
   */
  pricing: {
    title: '비용은 이렇게 정해집니다',
    lead: '전기공사는 규격 상품이 아니라 현장마다 사양이 다른 공사입니다. 일률 정찰가 대신, 무엇이 비용을 결정하는지 공개합니다.',
    leadHighlight: '현장마다 사양이 다른 공사',
    footnote: '* 견적서에는 항목별 자재·노무 내역이 분리 기재됩니다.',
    promise:
      '현장 방문 견적은 무료이며, 견적서 확인 후 진행 여부는 고객이 결정합니다. 어떠한 강요도 없습니다.',
    variables: [
      { no: 'V1', title: '규모 — 면적·회로 수·계약전력(kW)', note: '공사 범위를 결정하는 1차 변수' },
      { no: 'V2', title: '자재 사양 — 전선·차단기·반(盤) 등급', note: '견적서에 품명·규격 단위로 명기' },
      { no: 'V3', title: '현장 여건 — 가동 중 여부·층고·거리', note: '정전 협의·야간작업 필요 시 반영' },
    ],
    items: [
      { work: '공장 신축·증축 옥내외 전기공사',       audience: '공장·산업시설', priceLabel: '도면·면적·부하 기준 현장 산정' },
      { work: '계약전력 증설·수전설비 공사',          audience: '공장·상업건물', priceLabel: '증설 용량(kW) 기준' },
      { work: '동력설비(생산기계 전원) 배선·결선',    audience: '공장·산업시설', priceLabel: '설비 수·배선 거리 기준' },
      { work: '배전반·분전반 설계·설치',              audience: '공장·상업건물', priceLabel: '회로 수·반 규격 기준' },
      { work: '분전함(두꺼비집) 교체·증설',           audience: '주택·상가',     priceLabel: '회로 수 기준' },
      { work: '상가·병원 인테리어 전기',              audience: '상가·병원',     priceLabel: '면적(㎡)·조명 수 기준' },
      { work: '콘센트 추가·이동 / 조명 교체',         audience: '주택·아파트',   priceLabel: '개소 수 기준' },
    ],
  },

  faq: {
    title: '궁금한 점을 미리 확인하세요',
    lead: '',
    items: [
      { question: '견적은 정말 무료인가요?', answer: '네, 견적을 내기 위한 현장 방문 출장비도 포함해 완전 무료입니다. 방문 후 시공 진행 여부는 고객님이 결정하시며, 어떠한 강요도 없습니다.', segment: 'all' },
      { question: '전기공사업 면허 보유 여부를 어떻게 확인할 수 있나요?', answer: '사업자등록번호 637-81-02833으로 대한전기공사협회 홈페이지에서 전기공사업 등록 사실을 직접 조회하실 수 있습니다. 계약 시 면허증 사본도 제공해 드립니다.', segment: 'all' },
      { question: '시공 가능 지역은 어디인가요?', answer: '대구광역시 전 지역 및 경상북도(경산·영천·칠곡·성주·고령·구미 등) 중심으로 시공합니다. 공장·산업시설은 그 외 지역도 규모에 따라 검토하니 문의 주세요.', segment: 'all' },
      { question: '출장비가 따로 발생하나요?', answer: '견적을 위한 현장 방문은 대구·경북 지역 내에서 출장비 없이 무료입니다. 원거리 지역은 사전에 안내해 드립니다. 시공 착수 후 발생하는 이동 비용은 견적서에 포함해 사전에 안내드립니다.', segment: 'all' },
      { question: 'A/S 보증 기간은 얼마나 되나요?', answer: '전기공사 시공 부분은 준공 후 1년, 자재 불량은 제조사 보증 기간에 따릅니다. 대구·경북 지역은 당일~익일 출동 A/S를 원칙으로 합니다.', segment: 'all' },
      { question: '공사 비용은 대략 어느 정도인가요?', answer: '작업 범위·자재 사양·현장 여건에 따라 크게 달라지므로 일률적인 금액 안내가 어렵습니다. 대신 현장 방문 견적이 완전 무료이니 부담 없이 신청하세요. 견적서를 받아보신 후 진행 여부를 결정하시면 됩니다.', segment: 'all' },
      { question: '공장 신축 전기 설계 검토부터 준공까지 일괄로 맡길 수 있나요?', answer: '전기 설계 검토, 옥내외 배선·전선관, 동력설비 결선, 배전반 설계·설치까지 전 과정을 담당합니다. 건축 일정에 맞춰 체계적으로 진행하며 준공 서류도 지원합니다.', segment: 'industrial' },
      { question: '계약전력 증설과 수전설비 공사도 가능한가요?', answer: '네. 한국전력 계약전력 신청·증설부터 수전설비(수전반·계량·인입) 시공까지 처리합니다. 현장 전력 부하를 산정해 필요한 용량을 안전하게 확보해 드립니다.', segment: 'industrial' },
      { question: '생산라인 증설로 동력 전원이 추가로 필요한데 가동 중에도 공사가 되나요?', answer: '생산기계·모터 등 동력설비 전원 배선·결선을 시공합니다. 가동 중 현장은 라인별 정전 구간과 작업 시간을 사전에 협의해 생산 차질을 최소화하는 방식으로 진행합니다.', segment: 'industrial' },
      { question: '공장·창고용 대형 배전반도 맞춤 제작 가능한가요?', answer: '네. 현장 전기 부하를 계산해 규격을 산정하고 배전반·분전반을 맞춤 설계합니다. 제작은 협력 제작소에서 진행하고, 반입·설치·결선·시운전은 저희가 직접 처리합니다. 기존 배전반 유지보수·부품 교체도 가능합니다.', segment: 'industrial' },
      { question: '아파트·상가 인테리어 중 전기공사만 따로 의뢰할 수 있나요?', answer: '네, 가능합니다. 조명 교체, 콘센트 추가·이동, 배선 정리 등 인테리어 중 필요한 전기 작업만 단독으로 의뢰하셔도 됩니다. 기존 인테리어 업체 일정에 맞춰 유연하게 협조합니다.', segment: 'interior' },
      { question: '오래된 건물인데 분전함(두꺼비집) 교체가 필요할까요?', answer: '20년 이상 된 건물은 분전함 용량이 현재 사용 전력을 감당하지 못하는 경우가 많습니다. 무료 현장 점검으로 교체 필요 여부를 확인해 드리고, 현장에 맞춘 분전함으로 교체해 드립니다.', segment: 'interior' },
      { question: '카페·병원 오픈 전에 전기 용량이 충분한지 확인하고 싶어요.', answer: '주요 장비의 전력 사용량을 계산해 현재 전기 용량으로 충분한지 무료로 검토해 드립니다. 용량이 부족하면 계약 전력 증설과 분전함 교체까지 원스톱으로 처리합니다.', segment: 'interior' },
      { question: '인테리어 업체와 전기공사를 따로 진행해야 하나요?', answer: '우앤주전력은 인테리어 전기(조명·콘센트 배치)와 전기공사를 함께 처리합니다. 인테리어 업체와 직접 일정을 조율해 드리므로 고객님이 중간에서 조율할 필요가 없습니다.', segment: 'interior' },
    ],
  },

  quote: {
    title: '무료 현장 견적 신청',
    lead: '필수 입력 3개 — 30초면 접수됩니다',
    privacyNote: '개인정보 수집·이용에 동의합니다. (수집 항목: 성함·연락처·문의 내용 / 보유 기간: 문의 처리 후 1년)',
    successTitle: '견적문의가 접수되었습니다',
    successBody: '1영업일 이내에 담당자가 직접 연락드리겠습니다. 급하시면 010-8552-9994로 전화 주세요.',
    /** 폼 옆 레일 — 제출 후 무슨 일이 일어나는지 미리 보여줘 제출 부담을 낮춘다 */
    afterTitle: '접수 후 이렇게 진행됩니다',
    afterSteps: [
      { no: '01', title: '1영업일 내 담당자 직접 연락', note: '접수 확인 후 통화로 공사 내용을 확인합니다' },
      { no: '02', title: '현장 방문 견적 — 무료',        note: '출장비 없음 · 견적서 확인 후 결정' },
      { no: '03', title: '시공 → 준공 후 1년 보증',      note: '대구·경북 A/S 당일 출동 원칙' },
    ],
    callNote: '폼 작성이 번거로우시면 바로 통화',
  },

  /*
   * 연락처만 title·lead가 없다.
   * 이 섹션은 SectionHead(번호+제목)를 쓰지 않고 «연락처 | 오시는 길» 2열 안에
   * 각각 고정 h2를 두는 구조라 편집 대상 제목이 없다(Sections.tsx의 Contact).
   * 기본값에 남아 있던 두 값은 화면에 도달하지 못해 걷어냈다.
   */
  contact: {
    hours: '평일 09:00–18:00 · 토 09:00–13:00',
    hoursNote: '일요일·공휴일 휴무 (긴급 A/S는 상시 접수)',
    serviceArea: '대구광역시 전 지역 · 경상북도(경산·영천·칠곡·성주·고령·구미 등)',
  },

  /*
   * footer 섹션(tagline·note)이 여기 있었다.
   * 1b 블루프린트의 푸터는 사업자정보 고정 블록이라 편집 대상이 아니다 —
   * 내용은 lib/site.ts의 COMPANY 한 곳에서 온다. 편집 화면에도, 화면에도
   * 도달하지 않는 값이었고 저장돼 있던 행도 DB에서 지웠다(migrations/20260805).
   */

  /** 홈 메타데이터 — 검색 결과에 노출되는 제목·설명 */
  seo: {
    title: '대구·경북 공장 전기공사 | 수전설비·배전반 설치 | 우앤주전력',
    description:
      '대구·경북 공장 전기공사 전문. 신축·증축·수전설비·계약전력 증설·배전반 설계·설치. 인테리어 전기. 무료 견적 053-525-0424',
    keywords: [
      '대구 공장 전기공사', '경북 공장 전기', '수전설비 공사', '계약전력 증설',
      '배전반 설치', '분전반 설치', '동력설비 공사', '전기공사업', '우앤주전력', '대구 서구',
    ],
    /*
     * ogImageHeadline이 여기 있었다. OG 이미지는 app/opengraph-image.tsx가
     * 고정 문구로 그리므로 이 값을 고쳐도 미리보기가 바뀌지 않았다.
     */
  },
};

export type SiteContent = typeof CONTENT_DEFAULTS;
export type ContentKey = keyof SiteContent;

// ─────────────────────────────────────────────
//  어드민 폼 정의 — 이 배열로 편집 화면이 자동 생성된다
// ─────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'   // 줄바꿈 허용 긴 문구
  | 'image'
  | 'url'
  | 'boolean'
  | 'select'
  | 'tags'       // 문자열 배열 (쉼표 입력)
  | 'list';      // 객체 배열 (하위 필드 반복)

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  maxLength?: number;
  /** select 전용 */
  options?: { value: string; label: string }[];
  /** list 전용 */
  fields?: FieldDef[];
  itemTitleKey?: string;
  maxItems?: number;
  /** 편집은 못 하지만 어느 항목인지 알 수 있게 보여줄 값 */
  readOnly?: boolean;
}

export interface SectionDef {
  key: ContentKey;
  label: string;
  summary: string;
  /** 미리보기에서 이 섹션으로 스크롤할 앵커 (홈 기준) */
  anchor?: string;
  fields: FieldDef[];
}

/*
 * 아이콘 선택 목록은 없앴다. 1b 블루프린트는 신뢰 지표·자격 카드에 아이콘을 쓰지
 * 않고 값(등록번호·기간)만 큰 글씨로 낸다. 사업영역 카드 아이콘은 공종 id에 매여
 * 있어 고르는 대상이 아니다. 저장된 icon 값은 기본값에 그대로 남아 있다.
 */

/**
 * 섹션 머리 공통 필드.
 *
 * 1b 블루프린트에서 섹션 머리는 «번호 + 제목 + 보조 설명»이다(SectionHead).
 * 번호는 순서로 결정되고, 옛 디자인의 '작은 머리말(eyebrow)'은 자리가 없어졌다.
 * 그래서 편집 화면에서도 뺐다 — 고쳐도 화면이 그대로인 칸은 "저장이 안 된다"는
 * 오해를 만든다. 기본값에 남겨 두었던 각 섹션의 eyebrow도 이제 걷어냈다.
 * 히어로만 예외다. 히어로 머리는 SectionHead가 아니라 자체 레이아웃이고
 * eyebrow(등록번호 한 줄)를 실제로 렌더하므로 편집 대상으로 남는다.
 */
const HEADING_FIELDS: FieldDef[] = [
  { key: 'title',   label: '섹션 제목',   type: 'text', maxLength: 80 },
  { key: 'lead',    label: '설명 문구',   type: 'textarea', maxLength: 300,
    help: '제목 오른쪽에 작은 글씨로 붙습니다' },
];

export const SECTION_DEFS: SectionDef[] = [
  {
    key: 'banner',
    label: '상단 공지 배너',
    summary: '화면 최상단 띠. 휴무·이벤트 안내에 켜서 쓰고 평소엔 꺼둡니다.',
    fields: [
      { key: 'enabled',   label: '배너 표시',    type: 'boolean', help: '켜면 모든 페이지 맨 위에 나타납니다' },
      { key: 'text',      label: '안내 문구',    type: 'text', maxLength: 100 },
      { key: 'linkLabel', label: '버튼 문구',    type: 'text', maxLength: 20, help: '비워두면 버튼 없이 문구만 나옵니다' },
      { key: 'linkHref',  label: '버튼 링크',    type: 'url',  placeholder: '/#quote' },
    ],
  },
  {
    key: 'header',
    label: '헤더 (상단 메뉴)',
    summary: '로고 옆 상호와 메뉴 항목. 모든 페이지에 같은 헤더가 나옵니다.',
    fields: [
      { key: 'logoText',      label: '로고 옆 회사명', type: 'text', maxLength: 20 },
      { key: 'showBlogLink',  label: '메뉴에 블로그 추가', type: 'boolean', help: '켜면 메뉴 끝에 "전기공사 정보"가 붙습니다' },
      {
        key: 'nav', label: '메뉴 항목', type: 'list', itemTitleKey: 'label', maxItems: 8,
        help: '순서를 바꾸거나 항목을 추가·삭제할 수 있습니다',
        fields: [
          { key: 'label', label: '메뉴 이름', type: 'text', maxLength: 12 },
          { key: 'href',  label: '링크',      type: 'url', placeholder: '/#services 또는 /portfolio' },
        ],
      },
    ],
  },
  {
    key: 'hero',
    label: '히어로 (첫 화면)',
    summary: '방문자가 가장 먼저 보는 영역. 전환율에 가장 큰 영향을 줍니다.',
    // 홈의 히어로 섹션 id는 'top'이다. 'hero'로 두면 미리보기가 그 자리로 가지 않는다.
    anchor: 'top',
    fields: [
      { key: 'eyebrow', label: '작은 머리말', type: 'text', maxLength: 40,
        help: '제목 위에 대문자 간격으로 들어가는 한 줄 (예: 등록번호 안내)' },
      { key: 'title',   label: '큰 제목',     type: 'richtext', maxLength: 120, help: '줄을 나누려면 Enter를 누르세요' },
      { key: 'lead',    label: '설명 문구',   type: 'textarea', maxLength: 400,
        help: '"우앤주전력은 ○○입니다" 형태의 정의문으로 시작하세요. AI 검색이 이 문장을 그대로 인용합니다' },
      { key: 'leadHighlight', label: '설명 중 강조할 부분', type: 'text', maxLength: 60, help: '설명 문구 안에 이 글자가 있으면 굵게 표시됩니다' },
      { key: 'note',    label: '설명 아래 한 줄', type: 'text', maxLength: 80, help: '예: 현장 방문 견적 무료 · 출장비 없음' },
      { key: 'backgroundImage', label: '오른쪽 사진', type: 'image',
        help: '비우면 공장 전기 배선 평면도가 표시됩니다. 실제 시공 사진이 생기면 올려주세요' },
      {
        key: 'trustStats', label: '신뢰 지표 (4칸)', type: 'list', itemTitleKey: 'label', maxItems: 4,
        help: '숫자·등록번호처럼 확인 가능한 값일수록 신뢰도가 올라갑니다',
        fields: [
          { key: 'label', label: '큰 글씨 (값)',  type: 'text', maxLength: 24, help: '예: 대구-01425, 20년+, 당일 출동' },
          { key: 'sub',   label: '아래 설명',     type: 'text', maxLength: 34, help: '예: 전기공사업 등록번호' },
          { key: 'mono',  label: '숫자 서체', type: 'boolean', help: '등록번호처럼 숫자를 또박또박 보여줄 때 켜세요' },
        ],
      },
    ],
  },
  {
    key: 'quickForm',
    label: '빠른 견적 접수 (히어로 아래)',
    summary: '연락처만 받는 짧은 폼. 본 견적폼이 부담스러운 방문자를 잡습니다.',
    anchor: 'quick',
    fields: [
      { key: 'enabled',     label: '퀵폼 표시', type: 'boolean', help: '끄면 히어로 바로 아래 사업영역이 옵니다' },
      { key: 'title',       label: '제목',      type: 'text', maxLength: 30 },
      { key: 'note',        label: '부제',      type: 'text', maxLength: 60 },
      { key: 'consentNote', label: '동의 안내 문구', type: 'text', maxLength: 120 },
      { key: 'successTitle', label: '접수 완료 제목', type: 'text', maxLength: 60 },
      { key: 'successNote',  label: '접수 완료 안내', type: 'text', maxLength: 120 },
    ],
  },
  {
    key: 'services',
    label: '사업영역',
    summary: '3대 전문 분야 카드. 상세 페이지 본문은 개발자 영역입니다.',
    anchor: 'services',
    fields: [
      ...HEADING_FIELDS,
      {
        key: 'items', label: '사업영역 카드', type: 'list', itemTitleKey: 'title', maxItems: 6,
        fields: [
          { key: 'id',        label: '식별자(고정)', type: 'text', readOnly: true, help: '상세 페이지 주소와 연결돼 있어 바꿀 수 없습니다' },
          { key: 'title',     label: '카드 제목',    type: 'text', maxLength: 30 },
          { key: 'detail',    label: '카드 설명',    type: 'textarea', maxLength: 300 },
          { key: 'points',    label: '세부 항목',    type: 'tags', help: '한 줄에 하나씩 입력하세요' },
          { key: 'audiences', label: '대상 배지',    type: 'tags', help: '한 줄에 하나씩 (예: 공장, 물류센터)' },
          { key: 'tier',      label: '주력 표시',    type: 'select', options: [
            { value: 'primary',   label: '주력 (배지 표시)' },
            { value: 'secondary', label: '일반' },
          ] },
        ],
      },
    ],
  },
  {
    key: 'whyus',
    label: '검증 가능한 자격',
    summary: '등록번호 3종과 회사 개요 표. 번호 자체는 사업자 정보에서 자동으로 들어갑니다.',
    anchor: 'credentials',
    fields: [
      ...HEADING_FIELDS,
      { key: 'corpNote', label: '법인 등록 카드 설명', type: 'text', maxLength: 80 },
      { key: 'industry', label: '회사 개요 — 업종',    type: 'text', maxLength: 40 },
    ],
  },
  {
    key: 'process',
    label: '진행 절차',
    summary: '문의부터 A/S까지 단계 안내.',
    anchor: 'process',
    fields: [
      ...HEADING_FIELDS,
      {
        key: 'steps', label: '단계', type: 'list', itemTitleKey: 'title', maxItems: 6,
        fields: [
          { key: 'step',        label: '번호',   type: 'text', maxLength: 4 },
          { key: 'title',       label: '단계명', type: 'text', maxLength: 20 },
          { key: 'duration',    label: '소요 기간', type: 'text', maxLength: 24 },
          { key: 'description', label: '설명',   type: 'textarea', maxLength: 200 },
        ],
      },
    ],
  },
  {
    key: 'pricing',
    label: '비용 기준',
    summary: '금액 대신 “무엇이 금액을 정하는가”를 밝히는 영역. 변수 3개 + 작업 항목표.',
    anchor: 'pricing',
    fields: [
      ...HEADING_FIELDS,
      { key: 'leadHighlight', label: '설명 중 강조할 부분', type: 'text', maxLength: 40 },
      {
        key: 'variables', label: '비용을 정하는 변수 (3개)', type: 'list', itemTitleKey: 'title', maxItems: 5,
        help: '금액을 못 밝힐 때 신뢰를 주는 유일한 방법은 "무엇이 금액을 정하는가"를 밝히는 것입니다',
        fields: [
          { key: 'no',    label: '번호', type: 'text', maxLength: 4, help: '예: V1' },
          { key: 'title', label: '변수', type: 'text', maxLength: 50 },
          { key: 'note',  label: '한 줄 설명', type: 'text', maxLength: 60 },
        ],
      },
      { key: 'promise',  label: '약속 문구',   type: 'textarea', maxLength: 200 },
      { key: 'footnote', label: '표 아래 주석', type: 'textarea', maxLength: 200 },
      {
        key: 'items', label: '작업 항목표', type: 'list', itemTitleKey: 'work', maxItems: 20,
        fields: [
          { key: 'work',       label: '작업 항목',   type: 'text', maxLength: 60 },
          { key: 'audience',   label: '대상',        type: 'text', maxLength: 20 },
          { key: 'priceLabel', label: '비용 산정 기준', type: 'text', maxLength: 40,
            help: '금액이 아니라 "무엇으로 계산하는지"를 씁니다. 예: 회로 수 기준 / 면적(㎡) 기준' },
        ],
      },
    ],
  },
  {
    key: 'faq',
    label: '자주 묻는 질문',
    summary: '검색 결과에도 노출되는 영역(FAQ 구조화 데이터).',
    anchor: 'faq',
    fields: [
      ...HEADING_FIELDS,
      {
        key: 'items', label: '질문·답변', type: 'list', itemTitleKey: 'question', maxItems: 30,
        fields: [
          { key: 'question', label: '질문', type: 'text', maxLength: 120 },
          { key: 'answer',   label: '답변', type: 'textarea', maxLength: 1000 },
          { key: 'segment',  label: '대상 고객', type: 'select', options: [
            { value: 'all',        label: '공통' },
            { value: 'industrial', label: '공장·산업' },
            { value: 'interior',   label: '인테리어·일반' },
          ] },
        ],
      },
    ],
  },
  {
    key: 'quote',
    label: '견적 문의 폼',
    summary: '폼 주변 문구와 접수 완료 메시지.',
    anchor: 'quote',
    fields: [
      ...HEADING_FIELDS,
      { key: 'privacyNote',  label: '개인정보 동의 문구', type: 'textarea', maxLength: 300 },
      { key: 'successTitle', label: '접수 완료 제목',     type: 'text', maxLength: 40 },
      { key: 'successBody',  label: '접수 완료 안내',     type: 'textarea', maxLength: 200 },
      { key: 'afterTitle',   label: '폼 옆 안내 제목',    type: 'text', maxLength: 40 },
      {
        key: 'afterSteps', label: '접수 후 진행 3단계', type: 'list', itemTitleKey: 'title', maxItems: 4,
        help: '제출하면 무슨 일이 생기는지 미리 보여주면 폼 이탈이 줄어듭니다',
        fields: [
          { key: 'no',    label: '번호',      type: 'text', maxLength: 4 },
          { key: 'title', label: '단계',      type: 'text', maxLength: 40 },
          { key: 'note',  label: '한 줄 설명', type: 'text', maxLength: 60 },
        ],
      },
      { key: 'callNote', label: '전화 안내 문구', type: 'text', maxLength: 40 },
    ],
  },
  {
    /*
     * 오시는 길 — 제목("연락처"·"오시는 길")과 주소·전화는 고정이다.
     * 주소·번호는 lib/site.ts가 정본이고 JSON-LD·푸터·자격 섹션이 같은 값을 쓰므로,
     * 여기서 따로 고칠 수 있게 하면 NAP(상호·주소·전화)이 어긋난다.
     * 편집 대상은 영업시간과 시공 가능 지역뿐이다.
     */
    key: 'contact',
    label: '연락처·오시는 길',
    summary: '영업시간과 시공 가능 지역. 주소·전화번호는 사업자 정보라 고정입니다.',
    anchor: 'contact',
    fields: [
      { key: 'hours',       label: '영업시간',      type: 'text', maxLength: 60,
        help: '예: 평일 09:00–18:00 · 토 09:00–13:00' },
      { key: 'hoursNote',   label: '영업시간 주석', type: 'text', maxLength: 60 },
      { key: 'serviceArea', label: '시공 가능 지역', type: 'textarea', maxLength: 200 },
    ],
  },
  {
    key: 'seo',
    label: '검색엔진 노출 (홈)',
    summary: '네이버·구글 검색 결과에 그대로 보이는 제목과 설명입니다.',
    fields: [
      { key: 'title',       label: '검색 결과 제목', type: 'text', maxLength: 60,
        help: '한글 기준 30자 안팎이 잘리지 않습니다' },
      { key: 'description', label: '검색 결과 설명', type: 'textarea', maxLength: 160,
        help: '한글 기준 80자 안팎을 권장합니다' },
      { key: 'keywords',    label: '핵심 키워드',    type: 'tags', help: '한 줄에 하나씩' },
    ],
  },
];

export function getSectionDef(key: string): SectionDef | undefined {
  return SECTION_DEFS.find((s) => s.key === key);
}
