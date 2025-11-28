'use client';

import { useEffect } from 'react';

export default function ZoomPrevent() {
  useEffect(() => {
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventZoom);
    };
  }, []);

  return null; // UI 없음
}
