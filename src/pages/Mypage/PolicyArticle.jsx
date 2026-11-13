import { PRIVACY, TERMS } from './legalContent';

function PolicyArticle({ privacy }) {
  const title = privacy ? '개인정보 처리방침' : '서비스 이용 약관';
  return (
    <article className="[&_h3]:mb-2 [&_h3]:text-[18px] [&_h3]:font-semibold [&_ol]:pl-5 [&_ol]:text-[14px] [&_ol]:leading-[1.4] [&_ol]:text-[#8E8E8E] [&_section_p]:text-[14px] [&_section_p]:leading-[1.4] [&_section_p]:text-[#8E8E8E] [&>h2]:mt-6 [&>h2]:mb-2 [&>h2]:text-[24px] [&>h2]:font-semibold [&>h2]:text-[#121212] [&>p]:text-[16px] [&>p]:text-[#4B4B4B] [&>section]:mt-6 [&>section>p]:-ml-1">
      <h2>{title}</h2>
      <p>시행일 2026년 11월 01일</p>
      {privacy && (
        <p className="!font-regular mt-8 !text-[14px] !text-[#8E8E8E]">
          카똑은 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고, 관련
          문의를 신속하게 처리하기 위해 다음과 같이 처리방침을 둡니다. “카똑은
          카드번호, 유효기간, CVC, 카드사 계정 정보를 수집하지 않습니다.”
        </p>
      )}
      {(privacy ? PRIVACY : TERMS).map(([heading, paragraphs]) => (
        <section key={heading}>
          <h3>{heading}</h3>
          {!Array.isArray(paragraphs) ? (
            <>
              {paragraphs.text && (
                <p className="!text-[#6B7684]">{paragraphs.text}</p>
              )}
              {paragraphs.email && (
                <p className="!text-[#6B7684]">
                  이메일:{' '}
                  <a
                    href={`mailto:${paragraphs.email}`}
                    className="text-[#6B7684] underline underline-offset-2"
                  >
                    {paragraphs.email}
                  </a>
                </p>
              )}
              {paragraphs.bullets && (
                <ul className="list-disc pl-[18px] text-[14px] leading-[1.4] text-[#8E8E8E]">
                  {paragraphs.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </>
          ) : paragraphs.length > 1 ? (
            <ol className="list-outside list-decimal">
              {paragraphs.map((paragraph) => {
                const text =
                  typeof paragraph === 'string' ? paragraph : paragraph.text;
                return (
                  <li key={text}>
                    {text}
                    {typeof paragraph !== 'string' && paragraph.bullets && (
                      <ul className="list-outside list-disc pl-[18px]">
                        {paragraph.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>{paragraphs[0]}</p>
          )}
        </section>
      ))}
    </article>
  );
}

export default PolicyArticle;
