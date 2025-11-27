'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get('to') || '/game';
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadResources = async () => {
      const resources = [
        { delay: 300 },
        { delay: 400 },
        { delay: 500 },
        { delay: 300 },
        { delay: 400 }
      ];

      let currentProgress = 0;
      const progressStep = 100 / resources.length;

      for (let i = 0; i < resources.length; i++) {
        await new Promise(resolve => setTimeout(resolve, resources[i].delay));
        
        currentProgress += progressStep;
        setProgress(currentProgress);
      }

      setProgress(100);
      
      setTimeout(() => {
        router.replace(destination);
      }, 500);
    };

    loadResources();
  }, [router, destination]);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        {/* Now Loading... */}
        <h1 
          className="text-white text-2xl mb-8"
          style={{
            fontFamily: 'Comic Sans MS, cursive',
            letterSpacing: '2px'
          }}
        >
          Now Loading...
        </h1>
        
        {/* 로딩 바 */}
        <div className="relative w-[560px] h-12 border-2 border-white bg-black">
          <div 
            className="absolute top-0 left-0 h-full bg-white transition-all duration-300"
            style={{ 
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
