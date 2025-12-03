'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

// 버튼 위치 상수 분리
const BUTTON_POSITIONS = {
  start: { top: '41.5%', right: '20.1%', width: '17.2%', height: '8.4%' },
  dictionary: { top: '53.8%', right: '20.1%', width: '17.2%', height: '8.4%' },
} as const;

export default function StartPage() {
  const router = useRouter();

  const handleStart = () => router.push('/loading?to=/game');
  const handleDictionary = () => router.push('/loading?to=/dictionary');

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden">
      <div className="game-container">
        <Image 
          src="/images/game-screen.png"
          alt="Game Start Screen"
          fill
          className="object-contain select-none pointer-events-none"
          priority
          quality={100}
        />
        
        {/* START 버튼 */}
        <button 
          onClick={handleStart}
          className="game-button game-button-hover"
          style={BUTTON_POSITIONS.start}
        />
        
        {/* Dictionary 버튼 */}
        <button 
          onClick={handleDictionary}
          className="game-button game-button-hover"
          style={BUTTON_POSITIONS.dictionary}
        />
      </div>
    </div>
  );
}
