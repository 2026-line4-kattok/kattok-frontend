function Calculation() {
  return (
    <article className="[&_h3]:mb-[18px] [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:text-[#4B4B4B] [&>h2]:mt-6 [&>h2]:mb-2 [&>h2]:text-[24px] [&>h2]:font-semibold [&>h2]:text-[#121212] [&>p]:text-[16px] [&>p]:text-[#4B4B4B] [&>section]:mt-6">
      <h2>카똑은 이렇게 계산해요</h2>
      <p>
        결제하실 금액, 내 카드의 혜택 조건과 상태로
        <br />
        가장 유리한 카드를 계산해요
      </p>
      <section>
        <h3 className="mt-2">1. 먼저 오늘의 결제를 계산해요</h3>
        <div className="flex flex-wrap gap-2.5 px-[14px]">
          {[
            '카페',
            '약국',
            '마트',
            '택시',
            '편의점',
            '음식점',
            '온라인 쇼핑',
          ].map((tag) => (
            <span
              key={tag}
              className="font-regular inline-flex items-center justify-center gap-1 rounded-[27px] bg-[#E1E1E1] px-3 py-[10px] text-center text-[16px] leading-[1.4] text-[#4B4B4B]"
            >
              <div className="size-[18px] bg-[#FFFFFF]"></div>
              <span>{tag}</span>
            </span>
          ))}
        </div>
      </section>
      <section>
        <h3>2. 이런 혜택을 계산해요</h3>
        <div className="rounded-[8px] bg-[#FAFAFA] px-6 py-4 text-[14px] leading-[1.4] text-[#6E6E6E] [&>h4]:mb-3 [&>h4]:text-[14px] [&>h4]:text-[#8E8E8E] [&>hr]:-mx-6 [&>hr]:my-4 [&>hr]:border-0 [&>hr]:border-t [&>hr]:border-[#CACACA] [&>p+p]:mt-2.5">
          <p className="font-medium">
            할인 · 캐시백 · 1포인트 = 1원처럼 가치가 정해진 적립
          </p>
          <hr />
          <h4 className="font-medium">추천 미반영</h4>
          <p className="font-regular">
            해외 결제 · 공과금 · 통신요금 · 금융상품 · 무이자 할부 · 마일리지 ·
            가장 높은 혜택
          </p>
          <p>
            현재 소유한 카드로 미리 계산하기 위한 추천 계산이므로 실제 청구
            금액과 다를 수 있어요.
          </p>
        </div>
      </section>
      <section>
        <h3>3. 화면에 보이는 표시의 뜻</h3>
        {[
          [
            '조건부',
            '지난달 실적이나 남은 한도를 모를 때, 조건을 채웠다고 보고 계산한 결과예요. 정보를 알려주시면 다시 계산해요.',
          ],
          [
            '추정',
            '카똑에서 확인한 결제만으로 계산한 값이에요. 카똑 밖에서 쓴 금액은 반영되지 않아요.',
          ],
          ['확인 전', '아직 카똑이 모르는 정보예요. 몰라도 추천은 계속돼요.'],
        ].map(([title, text]) => (
          <div
            className="my-[18px] flex items-start gap-4 text-[14px] text-[#8E8E8E] [&>span]:min-h-[28px] [&>span]:min-w-[84px] [&>span]:rounded-[27px] [&>span]:bg-[#DBE1FF] [&>span]:px-3 [&>span]:py-[5px] [&>span]:text-center [&>span]:font-medium [&>span]:text-[#3B426B]"
            key={title}
          >
            <span>{title}</span>
            <p className="font-regular text-[14px] text-[#8E8E8E]">{text}</p>
          </div>
        ))}
      </section>
    </article>
  );
}

export default Calculation;
