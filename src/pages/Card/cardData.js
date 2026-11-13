import kbNori2Image from '@/assets/card/KB 국민은행 노리2.png';
import mrLifeImage from '@/assets/card/신한카드 Mr Life.png';
import hanaKPassCheckImage from '@/assets/card/하나 K패스 체크카드.png';

// TODO: API 연동 시 서버 데이터로 교체합니다.
// isPortrait: 세로형 카드 이미지는 가로로 눕혀서 보여줍니다.
// isPerformanceConfirmed: 전월 실적 확인 여부 (기본 true)
// benefits[].isLimitEntered: 사용자가 한도를 입력했는지 (기본 true, false면 '한도 입력' 버튼)
// benefits[].isEstimated: 한도가 추정값인지 ('추정' 뱃지)
export const MY_CARDS = [
  {
    id: 1,
    name: '하나 K-패스',
    type: '신용카드',
    image: hanaKPassCheckImage,
    isPortrait: true,
    performanceMonth: 10,
    isPerformanceConfirmed: true,
    benefits: [
      { id: 1, name: '카페 10% 할인', used: 3000, limit: 5000 },
      { id: 2, name: '편의점 10% 할인', used: 0, limit: 5000 },
      { id: 3, name: '택시 5% 할인', used: 3000, limit: 3000 },
    ],
  },
  {
    id: 2,
    name: '신한카드 Mr.Life',
    type: '신용카드',
    image: mrLifeImage,
    isPortrait: true,
    performanceMonth: 10,
    isPerformanceConfirmed: true,
    benefits: [
      { id: 1, name: '편의점 10% 할인', used: 1200, limit: 10000 },
      { id: 2, name: '마트 10% 할인', used: 4000, limit: 10000 },
    ],
  },
  {
    id: 3,
    name: 'KB국민 노리 2',
    type: '체크카드',
    image: kbNori2Image,
    isPortrait: false,
    performanceMonth: 10,
    isPerformanceConfirmed: false,
    benefits: [
      {
        id: 1,
        name: '온라인 쇼핑 5% 적립',
        used: 0,
        limit: 5000,
        isLimitEntered: false,
      },
      {
        id: 2,
        name: '카페 10% 할인',
        used: 0,
        limit: 3000,
        isLimitEntered: false,
        isEstimated: true,
      },
    ],
  },
];
