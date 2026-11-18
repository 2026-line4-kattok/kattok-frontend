import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '@/pages/Onboarding/authSession';
import { toOnboardingCardView } from '@/pages/Onboarding/onboardingCardImages';
import api from '@/api/axiosInstance';

// 화면 표시와 저장 요청에 사용하는 데이터 처리
export const won = (value) =>
  value == null ? '계산 안 됨' : `${value.toLocaleString('ko-KR')}원`;

export function kstDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export const currentMonth = () => kstDate().slice(0, 7);
export function moveMonth(month, delta) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
export function joinedDate(value) {
  if (!value) return '확인할 수 없어요';
  const [year, month, day] = kstDate(value).split('-');
  return `${year}년 ${month}월 ${day}일`;
}
export const UNREGISTERED_CARD = {
  id: 'other',
  name: '미등록 카드',
  image: null,
};

// 이미지 조회용 현재 상품 정보가 과거 기록의 스냅샷 이름을 덮어쓰지 않습니다.
export function makeCardResolver(ownedCards, products, imageView) {
  return (id, name, issuerName) => {
    if (id === 'other') return UNREGISTERED_CARD;
    const owned = ownedCards.find((card) => card.id === id);
    const matches = products.filter((product) => product.name === name);
    const product =
      owned?.product ??
      (matches.length === 1
        ? {
            ...matches[0],
            issuerName: matches[0].issuer?.name,
          }
        : { name: name ?? '', issuerName });
    const view = imageView({ id, product });
    return {
      ...view,
      id,
      name: name ?? product.name,
      issuerName: issuerName ?? product.issuerName,
    };
  };
}
export function paymentView(record, resolveCard) {
  const card =
    record.result === 'PAID_UNREGISTERED'
      ? UNREGISTERED_CARD
      : resolveCard(
          record.userCard?.userCardId ?? record.recommendedCard?.userCardId,
          record.userCard?.productName ?? record.recommendedCard?.productName,
        );
  return {
    ...record,
    id: record.recommendationId,
    date: kstDate(record.recommendedAt),
    place: record.merchant?.name ?? `${record.category.name} 업종`,
    category: record.category.name,
    categoryId: record.category.id,
    card,
    cardId: card.id,
    pending: record.result === 'PENDING',
    unpaid: record.result === 'NOT_PAID',
    saving: record.savedBenefit,
  };
}
export function paymentSelection(record) {
  if (record.result === 'NOT_PAID') return 'not-paid';
  if (record.result === 'PAID_UNREGISTERED') return 'other';
  return String(
    record.userCard?.userCardId ??
      record.recommendedCard?.userCardId ??
      'other',
  );
}
export function paymentOptions(record, resolveCard) {
  const options = [];
  const recommended = record.recommendedCard;
  if (recommended)
    options.push({
      ...resolveCard(recommended.userCardId, recommended.productName),
      value: String(recommended.userCardId),
      expectedBenefit: recommended.expectedBenefit,
      recommended: true,
      deleted: recommended.deleted,
      disabled: recommended.deleted && record.result !== 'PAID_RECOMMENDED',
    });
  for (const card of record.cardOptions)
    options.push({
      ...resolveCard(card.userCardId, card.productName, card.issuerName),
      value: String(card.userCardId),
      expectedBenefit: card.expectedBenefit,
    });
  // 삭제된 카드로 저장했던 기존 답은 그대로 표시·재전송할 수 있습니다.
  if (
    record.userCard &&
    !options.some((option) => option.id === record.userCard.userCardId)
  ) {
    options.push({
      ...resolveCard(record.userCard.userCardId, record.userCard.productName),
      value: String(record.userCard.userCardId),
      expectedBenefit: record.savedBenefit,
      deleted: true,
    });
  }
  options.push({ ...UNREGISTERED_CARD, value: 'other' });
  return options;
}
export function paymentRequest(record, selection) {
  if (selection === 'other') return { result: 'PAID_UNREGISTERED' };
  if (selection === 'not-paid') return { result: 'NOT_PAID' };
  const id = Number(selection);
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new Error('결제한 카드를 선택해주세요.');
  if (id === record.recommendedCard?.userCardId) {
    if (
      record.recommendedCard.deleted &&
      record.result !== 'PAID_RECOMMENDED'
    ) {
      throw new Error(
        '삭제된 추천 카드 대신 다른 카드나 미등록 카드를 선택해주세요.',
      );
    }
    return { result: 'PAID_RECOMMENDED' };
  }
  if (
    !record.cardOptions.some((card) => card.userCardId === id) &&
    !(record.result === 'PAID_OTHER' && record.userCard?.userCardId === id)
  ) {
    throw new Error('선택할 수 없는 카드예요. 카드 목록을 다시 불러와주세요.');
  }
  return { result: 'PAID_OTHER', userCardId: id };
}

// 공통 HTTP 클라이언트는 조회 훅에서 전달받습니다.
export function createMypageApi(api) {
  const list = (value) => {
    if (!Array.isArray(value))
      throw new Error('서버 응답을 확인하지 못했어요. 다시 시도해주세요.');
    return value;
  };
  async function getRecords(month, signal) {
    const data = await api.get('/v1/payment-records', {
      params: { month },
      signal,
    });
    if (
      data?.month !== month ||
      !Number.isFinite(data.savedBenefit?.amount) ||
      !Number.isInteger(data.savedBenefit?.paymentCount) ||
      !Number.isInteger(data.pendingCount)
    ) {
      throw new Error('결제 기록 응답을 확인하지 못했어요. 다시 시도해주세요.');
    }
    list(data.records);
    list(data.byCard);
    return data;
  }
  const getPending = async (signal) =>
    list(await api.get('/v1/payment-records/pending', { signal }));
  const getImageCards = async (signal) =>
    list(await api.get('/v1/owned-cards', { signal }));
  const getImageProducts = async (signal) =>
    list(await api.get('/v1/card-products', { signal }));
  async function getPayment(id, signal) {
    const data = await api.get(`/v1/recommendations/${id}/payment`, { signal });
    if (data?.recommendationId !== id)
      throw new Error('결제 정보를 확인하지 못했어요.');
    list(data.cardOptions);
    return data;
  }
  async function getProfile(signal) {
    const data = await api.get('/v1/users/me', { signal });
    if (!data?.id || !data.email || !data.createdAt)
      throw new Error('계정 정보를 확인하지 못했어요.');
    return data;
  }
  async function getDeletionSummary(signal) {
    const data = await api.get('/v1/users/me/deletion-summary', { signal });
    if (
      ![
        data?.ownedCardCount,
        data?.paymentRecordCount,
        data?.savedBenefitTotal,
      ].every(Number.isFinite)
    ) {
      throw new Error('삭제할 데이터 정보를 확인하지 못했어요.');
    }
    return data;
  }
  async function savePayment(id, body) {
    const result = await api.put(`/v1/recommendations/${id}/payment`, body);
    if (
      result?.recommendationId !== id ||
      result?.result !== body.result ||
      !Object.hasOwn(result, 'savedBenefit')
    ) {
      throw new Error(
        '저장 결과를 확인하지 못했어요. 결제 기록을 다시 불러와 확인해주세요.',
      );
    }
    return result;
  }
  const deleteAccount = () => api.delete('/v1/users/me');
  return {
    getRecords,
    getPending,
    getImageCards,
    getImageProducts,
    getPayment,
    getProfile,
    getDeletionSummary,
    savePayment,
    deleteAccount,
  };
}

export function requestError(error) {
  const code = error?.response?.data?.code;
  if (code === 'PAYMENT_SNAPSHOT_INCOMPLETE')
    return '이전 추천의 한도 정보가 부족해 저장하지 못했어요. 홈에서 새로 추천받아주세요. 기존 기록은 유지돼요.';
  if (code === 'DEMO_ACCOUNT_NOT_DELETABLE')
    return '시연용 계정은 탈퇴할 수 없어요.';
  if (code === 'OWNED_CARD_NOT_FOUND')
    return '삭제됐거나 선택할 수 없는 카드예요. 결제 정보를 다시 불러와주세요.';
  if (error?.response?.status === 401)
    return '로그인이 만료됐어요. 다시 로그인해주세요.';
  if (error?.code === 'ECONNABORTED')
    return '응답이 늦어지고 있어요. 잠시 후 다시 시도해주세요.';
  return (
    error?.response?.data?.message ||
    (error?.response
      ? '요청을 처리하지 못했어요. 다시 시도해주세요.'
      : error?.message === 'Network Error'
        ? '네트워크 연결을 확인하고 다시 시도해주세요.'
        : error?.message) ||
    '요청을 처리하지 못했어요. 다시 시도해주세요.'
  );
}

const requests = createMypageApi(api);

export default function useMypageApi(screen, month, editingId) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [session] = useState(() => ({
    id: crypto.randomUUID(),
    token: localStorage.getItem('accessToken'),
  }));
  const active = useRef(true);
  const scope = ['mypage', session.id];
  const isCurrent = useCallback(
    () =>
      active.current && session.token === localStorage.getItem('accessToken'),
    [session],
  );
  const endSession = useCallback(
    async (onboarding = true) => {
      if (!isCurrent()) return;
      active.current = false;
      clearAuthSession();
      await client.cancelQueries();
      client.clear();
      navigate(onboarding ? '/onboarding' : '/login', {
        replace: true,
        state: onboarding
          ? { back: true }
          : { message: '로그인이 만료됐어요. 다시 로그인해주세요.' },
      });
    },
    [client, isCurrent, navigate],
  );

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      // 이전 계정의 늦은 응답이 다음 계정 화면에 들어오지 않도록 합니다.
      void client.cancelQueries({ queryKey: ['mypage', session.id] });
    };
  }, [client, session]);

  const enabled = Boolean(session.token);
  const queryOptions = { retry: false, gcTime: 0 };
  const summary = useQuery({
    ...queryOptions,
    queryKey: [...scope, 'records', currentMonth()],
    queryFn: ({ signal }) => requests.getRecords(currentMonth(), signal),
    enabled: enabled && screen === 'dashboard',
  });
  const records = useQuery({
    ...queryOptions,
    queryKey: [...scope, 'records', month],
    queryFn: ({ signal }) => requests.getRecords(month, signal),
    enabled: enabled && screen === 'history',
  });
  const pending = useQuery({
    ...queryOptions,
    queryKey: [...scope, 'pending'],
    queryFn: ({ signal }) => requests.getPending(signal),
    enabled: enabled && screen === 'history',
  });
  const profile = useQuery({
    ...queryOptions,
    queryKey: [...scope, 'profile'],
    queryFn: ({ signal }) => requests.getProfile(signal),
    enabled: enabled && screen === 'account',
  });
  const deletion = useQuery({
    ...queryOptions,
    queryKey: [...scope, 'deletion'],
    queryFn: ({ signal }) => requests.getDeletionSummary(signal),
    enabled: enabled && screen === 'withdrawal',
  });
  const payment = useQuery({
    ...queryOptions,
    queryKey: [...scope, 'payment', editingId],
    queryFn: ({ signal }) => requests.getPayment(editingId, signal),
    enabled: enabled && editingId != null,
  });
  const imageCards = useQuery({
    ...queryOptions,
    queryKey: [...scope, 'image-cards'],
    queryFn: ({ signal }) => requests.getImageCards(signal),
    enabled: enabled && ['dashboard', 'history'].includes(screen),
  });
  const imageProducts = useQuery({
    ...queryOptions,
    queryKey: [...scope, 'image-products'],
    queryFn: ({ signal }) => requests.getImageProducts(signal),
    enabled: enabled && ['dashboard', 'history'].includes(screen),
  });
  const unauthorized = [
    summary,
    records,
    pending,
    profile,
    deletion,
    payment,
    imageCards,
    imageProducts,
  ].some((query) => query.error?.response?.status === 401);
  useEffect(() => {
    if (!session.token || unauthorized) void endSession(false);
  }, [endSession, session, unauthorized]);

  const resolveCard = makeCardResolver(
    imageCards.data ?? [],
    imageProducts.data ?? [],
    toOnboardingCardView,
  );
  const refreshPayments = () =>
    Promise.all(
      [
        ['mypage', session.id],
        ['home'],
        ['owned-cards'],
        ['merchants', 'recent'],
      ].map((queryKey) => client.invalidateQueries({ queryKey })),
    );

  const mutate = async (request) => {
    if (!isCurrent())
      throw new Error('로그인 상태가 변경됐어요. 다시 로그인해주세요.');
    try {
      const result = await request();
      if (!isCurrent())
        throw new Error('로그인 상태가 변경됐어요. 다시 로그인해주세요.');
      return result;
    } catch (error) {
      if (error.response?.status === 401) await endSession(false);
      throw error;
    }
  };

  return {
    summary,
    records,
    pending,
    profile,
    deletion,
    payment,
    resolveCard,
    isCurrent,
    endSession,
    refreshPayments,
    savePayment: (id, body) => mutate(() => requests.savePayment(id, body)),
    deleteAccount: () => mutate(requests.deleteAccount),
  };
}
