// 결제 확인 저장(5-2) 결과 → 토스트 문구 { title, description, isNotPaid }

const formatWon = (value) => `${value.toLocaleString('ko-KR')}원`;

// 이번 저장으로 새로 소진된 한도 안내 (두 번째 줄)
const getExhaustedMessage = (capChanges = []) => {
  const exhausted = capChanges.filter(
    (cap) => cap.newlyAmountExhausted || cap.newlyCountExhausted,
  );
  if (exhausted.length === 0) return null;
  const [first] = exhausted;
  const kind = first.newlyAmountExhausted ? '한도' : '횟수';
  const rest = exhausted.length > 1 ? ` 외 ${exhausted.length - 1}건` : '';
  return `${first.description} ${kind}를 다 썼어요${rest}`;
};

export const getPaymentResultMessage = (response, place) => {
  const recordedText = place ? `${place} 결제건을 기록했어요` : '기록했어요';

  switch (response?.result) {
    case 'NOT_PAID':
      return {
        title: '기록했어요',
        description: '결제하지 않은 것으로 기록했어요',
        isNotPaid: true,
      };
    case 'PAID_UNREGISTERED':
      return { title: '기록했어요', description: recordedText };
    default: {
      // 추천 당시 계산하지 않은 카드는 null (0원과 구분)
      if (response?.savedBenefit == null) {
        return {
          title: '기록했어요',
          description: '이 카드의 예상 혜택은 계산되지 않았어요',
        };
      }
      return {
        title: `${formatWon(response.savedBenefit)} 챙겼어요`,
        description: getExhaustedMessage(response.capChanges) ?? recordedText,
      };
    }
  }
};

// 저장 실패 → 토스트 문구
export const getPaymentErrorMessage = (error) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;

  if (code === 'OWNED_CARD_NOT_FOUND') {
    return {
      title: '고를 수 없는 카드예요',
      description: '삭제된 카드예요. 다른 카드를 골라 주세요',
    };
  }
  if (code === 'RECOMMENDATION_NOT_FOUND' || status === 404) {
    return {
      title: '결제 기록을 찾을 수 없어요',
      description: '홈에서 다시 확인해 주세요',
    };
  }
  if (code === 'PAYMENT_SNAPSHOT_INCOMPLETE') {
    return {
      title: '기록하지 못했어요',
      description: '추천 정보가 부족해요. 다시 추천받아 주세요',
    };
  }
  if (code === 'PAYMENT_NOT_REQUESTED' || status === 409) {
    return {
      title: '기록하지 못했어요',
      description: '결제 확인을 기다리는 기록이 아니에요',
    };
  }
  return {
    title: '기록하지 못했어요',
    description: '잠시 후 다시 시도해 주세요',
  };
};
