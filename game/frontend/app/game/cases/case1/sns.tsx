// app/game/cases/case1/sns.tsx
export default function Case1SNS() {
  return (
    <div className="w-full h-full space-y-4">
      <p className="mb-2">[SNS 기록] 사건 전후 홍길동의 SNS 활동입니다.</p>
      <div className="bg-white/5 p-3 rounded-lg">
        <p className="text-sm text-gray-300">사건 전날 밤 11:48</p>
        <p>“요즘 너무 피곤하다… 내일도 회의라니.”</p>
      </div>
      <div className="bg-white/5 p-3 rounded-lg">
        <p className="text-sm text-gray-300">사건 당일 오전 8:15</p>
        <p>“오늘은 꼭 잘 버텨보자.”</p>
      </div>
      <div className="bg-white/5 p-3 rounded-lg">
        <p className="text-sm text-gray-300">사건 이후</p>
        <p>“갑자기 경찰서에서 연락이 왔다. 내가 왜…?”</p>
      </div>
    </div>
  );
}
