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
