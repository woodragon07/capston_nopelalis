// app/game/cases/case1/document.tsx
export default function Case1Document() {
  return (
    <div className="w-full h-full">
      <p className="mb-4">
        [문서 증거] 사건 1에 대한 공식 기록입니다. 피의자 홍길동은 사건 당일,
        회사 회의에 참석했다는 알리바이를 주장하고 있습니다.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>출근 기록: 09:02 카드 태그</li>
        <li>회의실 CCTV: 09:10 ~ 10:00 참석</li>
        <li>동료 진술: 회의 중 자리를 비운 적 없음</li>
      </ul>
    </div>
  );
}
