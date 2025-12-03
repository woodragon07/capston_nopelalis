// app/game/cases/case1/etc.tsx
export default function Case1Etc() {
  return (
    <div className="w-full h-full space-y-4">
      <p>[기타 증거] 사건과 직접적 연관은 없지만 참고할 만한 정보들입니다.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>최근 3개월 간 주말에도 야근이 이어짐</li>
        <li>동료들과의 갈등 기록 없음</li>
        <li>익명 사내 게시판에 “요즘 팀장이 너무 심하다” 라는 글이 올라왔으나 작성자 미확인</li>
      </ul>
      <p className="text-sm text-gray-300">
        이 정보들은 동기를 추정하거나, 피의자의 심리 상태를 파악하는 데 참고용으로 사용될 수 있습니다.
      </p>
    </div>
  );
}
