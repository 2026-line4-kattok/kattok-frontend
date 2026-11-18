import { toOwnedCardView } from '@/pages/Card/ownedCardMapper';
import { findReceivedEntry } from '@/utils/cardImages';

// 카드 이미지 매칭은 내 카드·추천 결과와 같은 유틸(@/utils/cardImages)을 씁니다.
export const findOnboardingCardImage = (product) => findReceivedEntry(product);

// toOwnedCardView가 이미 같은 방식으로 이미지를 찾으므로 그대로 씁니다.
export function toOnboardingCardView(ownedCard) {
  return toOwnedCardView(ownedCard);
}
