import { flushSync } from 'react-dom';

let activeTransition;
let fallbackAnimation;

// 이전 화면과 다음 화면을 브라우저 스냅샷으로 겹쳐 전환합니다.
export async function dissolve(update) {
  activeTransition?.skipTransition();
  fallbackAnimation?.cancel();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    flushSync(update);
    return;
  }

  if (typeof document.startViewTransition === 'function') {
    const transition = document.startViewTransition(() => flushSync(update));
    activeTransition = transition;
    // 탭이 숨겨져 전환이 생략돼도 상태 갱신은 정상적으로 완료됩니다.
    void transition.ready.catch(() => {});
    void transition.finished.finally(() => {
      if (activeTransition === transition) activeTransition = undefined;
    }).catch(() => {});
    await transition.updateCallbackDone;
    return;
  }

  // View Transition 미지원 브라우저에서는 새 화면을 페이드 인합니다.
  flushSync(update);
  fallbackAnimation = document.documentElement.animate?.(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 250, easing: 'ease-in-out' },
  );
}
