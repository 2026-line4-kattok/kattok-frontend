import emptyCardImage from '@/assets/onboarding/card/empty.png';

// 카드 이미지: 파일 이름(카드명)으로 찾아 씁니다. 서버가 이미지 URL을 주면 교체합니다.
const CARD_IMAGES = import.meta.glob('@/assets/card/*.png', {
  eager: true,
  import: 'default',
});

// 가로형 이미지 (나머지 카드 이미지는 세로형이라 가로로 눕혀서 보여줍니다.)
const HORIZONTAL_IMAGE_KEYS = new Set(['kb국민은행노리2']);

// 공백·기호를 지워 이름 비교를 느슨하게 합니다.
const normalize = (value = '') =>
  value.toLowerCase().replace(/[^0-9a-z가-힣]/g, '');

const CARD_IMAGE_ENTRIES = Object.entries(CARD_IMAGES).map(([path, src]) => ({
  key: normalize(
    decodeURIComponent(path)
      .split('/')
      .pop()
      .replace(/\.png$/, ''),
  ),
  src,
}));

const findCardImage = ({ name, issuerName }) => {
  const candidates = [normalize(name), normalize(`${issuerName}${name}`)];
  const found =
    CARD_IMAGE_ENTRIES.find(({ key }) => candidates.includes(key)) ??
    CARD_IMAGE_ENTRIES.find(({ key }) =>
      candidates.some((c) => c && (key.includes(c) || c.includes(key))),
    );
  if (!found) return { image: emptyCardImage, isHorizontal: true };
  return {
    image: found.src,
    isHorizontal: HORIZONTAL_IMAGE_KEYS.has(found.key),
  };
};

const CARD_TYPE_LABEL = {
  CREDIT: '신용카드',
  CHECK: '체크카드',
};

// 지난달 실적은 매월 1일 00:00(한국 시간)에 초기화되므로, 한국 시간 기준 지난달을 씁니다.
export const getPerformanceMonth = (now = new Date()) => {
  const kstMonth = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      month: 'numeric',
    }).format(now),
  );
  return kstMonth === 1 ? 12 : kstMonth - 1;
};

// GET /api/v1/owned-cards 응답 한 건 → 내 카드 화면 모델
export const toOwnedCardView = (ownedCard) => {
  const { product, performanceStatus } = ownedCard;
  const { image, isHorizontal } = findCardImage(product);
  // SINGLE·MULTIPLE + UNKNOWN일 때만 실적 입력이 필요합니다. (UNKNOWN만으로 판단하지 않음)
  const needsPerformance =
    ['SINGLE', 'MULTIPLE'].includes(product.performanceType) &&
    performanceStatus === 'UNKNOWN';

  return {
    id: ownedCard.id,
    productId: product.id,
    name: product.name,
    issuerName: product.issuerName,
    type: CARD_TYPE_LABEL[product.cardType] ?? product.cardType,
    image,
    isHorizontal,
    dataStatus: product.dataStatus,
    performanceType: product.performanceType,
    performanceStatus,
    performanceTier: ownedCard.performanceTier,
    performanceMonth: getPerformanceMonth(),
    needsPerformance,
    representativeBenefit: ownedCard.representativeBenefit,
    statusChip: ownedCard.statusChip,
    createdAt: ownedCard.createdAt,
    // TODO: 3-2 카드 상세 API 연동 시 혜택별 사용 금액·한도와 사용 현황 질문 데이터를 채웁니다.
    benefits: [],
    benefitCategories: [],
    performanceRequirement: undefined,
  };
};
