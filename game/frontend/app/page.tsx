'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';



export default function StartPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/loading?to=/game');
  };
  const handleDictionary = () => {
    router.push('/loading?to=/dictionary')
  };

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div 
      className="relative"
      style={{
        width: '100vw',
        height: '56.25vw', // 16:9 비율
        maxHeight: '100vh',
        maxWidth: '177.78vh', // 16:9 비율
      }}
      >
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
        className="absolute cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] hover:brightness-110"
        style={{
          top: '41.5%',
          right: '20.1%',
          width: '17.2%',
          height: '8.4%'
          }}
          />
          
          {/* Dictionary 버튼 */}
          <button 
          onClick={handleDictionary}
          className="absolute cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] hover:brightness-110"
          style={{
            top: '53.8%',
            right: '20.1%',
            width: '17.2%',
            height: '8.4%'
          }}
          />
      </div>
    </div>
  );
}
