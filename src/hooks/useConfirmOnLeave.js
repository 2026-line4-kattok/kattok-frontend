import { useCallback, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import useConfirmRecommendation from '@/hooks/useConfirmRecommendation';

// 추천 결과(/payment/:id)·결제 카드 변경(/payment/:id/card) 화면끼리의 이동은 이탈로 보지 않습니다.
const isPaymentFlowPath = (pathname) =>
  /^\/payment\/[^/]+(\/card)?$/.test(pathname) &&
  pathname !== '/payment/amount';

export const hasRecommendedCard = (recommendation) =>
  recommendation?.recommendedCardId != null &&
  (recommendation.overallStatus === 'CONFIRMED' ||
    recommendation.overallStatus === 'CONDITIONAL');

// [X]·뒤로 가기·하단 탭 등으로 추천 화면을 벗어나면 결제 확인 대기 기록(4-7)을 만들어
// 홈의 결제 확인 카드로 실제 결제 여부를 묻습니다.
// [바로 결제]처럼 직접 기록을 마친 경우에는 반환하는 skip()을 먼저 호출하세요.
export default function useConfirmOnLeave(recommendationId, enabled) {
  const skipRef = useRef(false);
  const leavingRef = useRef(false);
  const { mutate: confirm } = useConfirmRecommendation();

  const blocker = useBlocker(
    ({ nextLocation }) =>
      enabled &&
      recommendationId != null &&
      !skipRef.current &&
      !isPaymentFlowPath(nextLocation.pathname),
  );

  useEffect(() => {
    if (blocker.state !== 'blocked' || leavingRef.current) return;
    leavingRef.current = true;
    skipRef.current = true;
    // 대기 기록은 여러 번 호출해도 1건이고, 실패해도 이동은 막지 않습니다.
    confirm(recommendationId, { onSettled: () => blocker.proceed() });
  }, [blocker, confirm, recommendationId]);

  return useCallback(() => {
    skipRef.current = true;
  }, []);
}
