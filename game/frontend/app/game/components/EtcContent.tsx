export const TAB_NAME = '기타';

export default function EtcContent() {
  return (
    <div className="relative w-full h-full">
      <h2 
        className="absolute text-black font-[var(--font-bm)]"
        style={{
            top: '0.5%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '1.4vw',
            fontFamily: 'var(--font-bm)',
        }}
      >
        기 타 증 거
      </h2>
      
      <div 
        className="absolute overflow-y-auto text-white p-4" 
        style={{
          top: '15%',
          left: '78%',
          width: '90%',
          height: '80%',
          transform: 'translateX(-50%)',
          fontSize: '1.4vw',
          fontFamily: 'var(--font-bm)',
        }}
      >
        <p>이것은 기타 증거입니다.</p>
      </div>
    </div>
  );
}
