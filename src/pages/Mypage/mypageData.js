import kbImage from '@/assets/card/KB 국민은행 노리2.png';
import mrLifeImage from '@/assets/card/신한카드 Mr Life.png';
import hanaImage from '@/assets/card/하나 K패스 체크카드.png';

export const CARDS = [
  { id: 'kb', name: 'KB국민 노리2', image: kbImage, rate: 0.1, cap: 3000 },
  {
    id: 'shinhan',
    name: '신한 Mr.Life',
    image: mrLifeImage,
    rate: 0.1,
    cap: 2000,
  },
  { id: 'hana', name: '하나 K-패스', image: hanaImage, rate: 0, cap: 0 },
  { id: 'other', name: '미등록 카드', image: null, rate: 0, cap: 0 },
];

// 시안의 카드별 요약 금액
export const INITIAL_CARD_SAVINGS = {
  shinhan: 5300,
  kb: 3000,
  hana: 1000,
};

// UI 확인용 예시 데이터
export const INITIAL_PAYMENTS = [
  {
    id: 'p1',
    date: '2026-11-02',
    place: '스타벅스',
    category: '카페',
    amount: 30000,
    cardId: 'kb',
    saving: 3000,
  },
  {
    id: 'p2',
    date: '2026-11-02',
    place: 'GS25',
    category: '편의점',
    amount: 23000,
    cardId: 'shinhan',
    saving: 2300,
  },
  {
    id: 'p3',
    date: '2026-11-01',
    place: 'CU',
    category: '편의점',
    amount: 30000,
    cardId: 'kb',
    saving: 3000,
  },
  {
    id: 'p4',
    date: '2026-11-01',
    place: '이디야커피',
    category: '카페',
    amount: 6000,
    cardId: 'shinhan',
    saving: 0,
    unpaid: true,
  },
  {
    id: 'p5',
    date: '2026-10-31',
    place: '메가커피',
    category: '카페',
    amount: 15000,
    cardId: 'shinhan',
    saving: 3000,
  },
  {
    id: 'p6',
    date: '2026-10-31',
    place: '투썸플레이스',
    category: '카페',
    amount: 15000,
    cardId: 'hana',
    saving: 1100,
  },
  {
    id: 'pending',
    date: '2026-11-02',
    place: 'CU',
    category: '편의점',
    amount: 45000,
    cardId: 'kb',
    saving: 0,
    pending: true,
  },
];
export const INITIAL_MONTH = '2026-11';
export const won = (value) => `${value.toLocaleString('ko-KR')}원`;
export const findCard = (id) =>
  CARDS.find((card) => card.id === id) ?? CARDS[3];
export const estimateSaving = (payment, card) =>
  Math.min(Math.floor(payment.amount * card.rate), card.cap);
export const totalSaving = (payments) =>
  payments.reduce(
    (sum, item) => sum + (item.unpaid || item.pending ? 0 : item.saving),
    0,
  );

export function moveMonth(month, delta) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthlyPayments(payments, month) {
  // 월초 화면에는 전월 말일 기록도 함께 노출
  const previous = moveMonth(month, -1);
  return payments.filter(
    (item) =>
      item.date.startsWith(month) ||
      (item.date.startsWith(previous) && Number(item.date.slice(-2)) >= 31),
  );
}
