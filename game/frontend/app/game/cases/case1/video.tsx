// app/game/cases/case1/video.tsx
export default function Case1Video() {
  return (
    <div className="w-full h-full space-y-4">
      <p className="mb-2">[영상 증거] 사건과 관련된 CCTV 요약입니다.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>08:55 건물 출입구: 홍길동 입장</li>
        <li>09:08 엘리베이터: 회의실 층으로 이동</li>
        <li>09:12 회의실 입장</li>
        <li>09:12 ~ 09:58 회의 진행, 별도 이동 없음</li>
      </ul>
      <p className="mt-4 text-sm text-gray-300">
        ※ 원본 영상은 용량 문제로 별도 보관 중입니다. 현재는 주요 장면의 캡처와 로그만 제공됩니다.
      </p>
    </div>
  );
}
