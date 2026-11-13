import kbNori2Image from '@/assets/card/KB 국민은행 노리2.png';
import mrLifeImage from '@/assets/card/신한카드 Mr Life.png';
import hanaKPassCheckImage from '@/assets/card/하나 K패스 체크카드.png';

// TODO: API 연동 시 서버 데이터로 교체합니다. (결제 기록 id로 조회)
export const PAYMENT_DETAILS = {
  1: {
    id: 1,
    place: '스타벅스',
    category: '카페',
    amount: 30000,
    // 카똑이 추천한 카드
    recommendedCardId: 'kb-nori2',
    cards: [
      {
        id: 'kb-nori2',
        name: 'KB국민 노리2 체크카드',
        brandName: 'KB국민 노리2',
        shortName: '노리 2',
        image: kbNori2Image,
        isHorizontal: true,
        discount: 3000,
        rate: 10,
        isConditional: true,
        // 지난달 실적 조건과 할인 한도를 확인해야 하는 업종 (카드 사용 현황 바텀시트에서 물어봅니다)
        performanceRequirement: 300000,
        // 월 할인 한도
        monthlyLimit: 3000,
        benefitCategories: ['카페', '온라인 쇼핑'],
        conditionNotice: {
          title: '노리 2의 지난달 실적을 아직 몰라요',
          description:
            '실적 조건(30만 원 이상)을 채웠다고 보고 10% 할인을 전부 적용했어요. 지난달 실적을 업데이트 하면 남은 한도 기준으로 정확히 계산할 수 있어요.',
        },
      },
      {
        id: 'shinhan-mr-life',
        name: '신한 Mr.Life',
        shortName: 'Mr.Life',
        image: mrLifeImage,
        discount: 2000,
        rate: 10,
        // 이번 달 남은 할인 한도 (할인 금액이 이 한도까지만 적용됩니다)
        remainingLimit: 2000,
        isConditional: false,
      },
      {
        id: 'hana-k-pass',
        name: '하나 K-패스',
        shortName: 'K-패스',
        image: hanaKPassCheckImage,
        discount: 0,
        rate: 0,
        isConditional: false,
      },
    ],
  },
};

export const formatWon = (value) => `${value.toLocaleString('ko-KR')}원`;

// 카드 사용 현황(실적·할인 사용 금액)을 알려준 조건부 카드를 다시 계산합니다.
// TODO: API 연동 시 입력한 사용 현황을 보내고 서버에서 다시 계산된 혜택을 받아옵니다.
export const applyCardUsage = (card, amount) => {
  const fullDiscount = Math.floor((amount * card.rate) / 100);
  const limit = card.monthlyLimit;
  const discount =
    limit === undefined ? fullDiscount : Math.min(fullDiscount, limit);

  let description;
  if (limit !== undefined) {
    description =
      discount < fullDiscount
        ? `월 한도 ${formatWon(limit)}까지만 적용돼요.`
        : `월 한도 ${formatWon(limit)} 안이라 혜택이 전부 적용돼요.`;
  }

  return {
    ...card,
    discount,
    isConditional: false,
    isVerified: true,
    conditionNotice: {
      title: '알려주신 실적으로 다시 계산했어요',
      description,
    },
  };
};

// 업종별 카드 혜택 (업종 → 할인율 %)
// TODO: API 연동 시 서버에서 금액·장소 기준으로 계산된 혜택을 받아옵니다.
const CARD_BENEFITS = [
  {
    id: 'kb-nori2',
    name: 'KB국민 노리2 체크카드',
    brandName: 'KB국민 노리2',
    shortName: '노리 2',
    image: kbNori2Image,
    isHorizontal: true,
    rates: { 카페: 10, 편의점: 10 },
    // 카드 사용 현황에서 할인 사용 금액을 물어볼 업종
    benefitCategories: ['카페', '온라인 쇼핑'],
    // 지난달 실적을 몰라 조건을 채웠다고 가정하고 계산하는 카드
    isConditional: true,
    performanceRequirement: 300000,
    // 월 할인 한도
    monthlyLimit: 3000,
  },
  {
    id: 'shinhan-mr-life',
    name: '신한 Mr.Life',
    shortName: 'Mr.Life',
    image: mrLifeImage,
    rates: { 카페: 10, 편의점: 10, 택시: 10, 마트: 5 },
    remainingLimit: 2000,
    isConditional: false,
  },
  {
    id: 'hana-k-pass',
    name: '하나 K-패스',
    shortName: 'K-패스',
    image: hanaKPassCheckImage,
    rates: {},
    isConditional: false,
  },
];

const calculateCard = ({ rates, ...card }, category, amount) => {
  const rate = rates[category] ?? 0;
  const fullDiscount = Math.floor((amount * rate) / 100);
  const discount =
    card.remainingLimit === undefined
      ? fullDiscount
      : Math.min(fullDiscount, card.remainingLimit);

  return {
    ...card,
    rate,
    discount,
    benefitCategories: card.benefitCategories ?? Object.keys(rates),
    ...(card.isConditional &&
      rate > 0 && {
        conditionNotice: {
          title: `${card.shortName}의 지난달 실적을 아직 몰라요`,
          description: `실적 조건(${card.performanceRequirement / 10000}만 원 이상)을 채웠다고 보고 ${rate}% 할인을 전부 적용했어요. 지난달 실적을 업데이트 하면 남은 한도 기준으로 정확히 계산할 수 있어요.`,
        },
      }),
  };
};

let nextPaymentId = Math.max(...Object.keys(PAYMENT_DETAILS).map(Number)) + 1;

// 입력한 결제 금액으로 카드별 혜택을 계산해 결제 기록을 만듭니다.
// 상세·카드 변경 화면이 id로 조회할 수 있도록 PAYMENT_DETAILS에 함께 저장합니다.
export const createPaymentDetail = ({ place, category, amount }) => {
  const cards = CARD_BENEFITS.map((card) =>
    calculateCard(card, category, amount),
  ).sort((a, b) => b.discount - a.discount);

  const payment = {
    id: nextPaymentId++,
    place: place ?? category,
    category,
    amount,
    recommendedCardId: cards[0].id,
    cards,
  };
  PAYMENT_DETAILS[payment.id] = payment;
  return payment;
};

export const hasBenefit = (payment) =>
  payment.cards.some((card) => card.discount > 0);
