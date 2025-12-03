'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get('to') || '/game';
  const [progress, setProgress] = useState(0);


  useEffect(() => {
    const loadResources = async () => {
      const resources = [300, 400, 500, 300, 400];
      const progressStep = 100 / resources.length;
      let currentProgress = 0;

      for (const delay of resources) {
        await new Promise(resolve => setTimeout(resolve, delay));
        currentProgress += progressStep;
        setProgress(currentProgress);
      }

      setProgress(100);
      setTimeout(() => router.replace(destination), 500);
    };

    loadResources();
  }, [router, destination]);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        {/* Now Loading 이미지 */}
        <img 
          src="/images/now_loading.png"
          alt="Now Loading..."
          className="mb-8 mx-auto h-12 w-auto"
        />
        
        {/* 로딩 바 */}
        <div className="relative w-[570px] h-12">
          <div className="absolute inset-0 border-2 border-white pointer-events-none z-10" />
          <div 
            className="absolute -left-[70px] -right-[70px] -top-[50px] -bottom-[50px] overflow-hidden"
            style={{ 
              backgroundImage: 'url(/images/loadingbar.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* 동적 progress 값만 인라인 스타일 */}
            <div 
              className="absolute top-5 right-0 h-full bg-black transition-all duration-300"
              style={{ width: `${100 - progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default function LoadingPage() {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <LoadingContent />
    </Suspense>
  );
}

