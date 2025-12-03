// app/game/layout.tsx
import Image from 'next/image';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="game-container">
        <Image 
          src="/images/background.png"
          alt="Game Background"
          fill
          className="object-contain select-none pointer-events-none"
          priority
          quality={100}
        />
        {children}  {/* GameScreen, loading 등 */}
      </div>
    </div>
  );
}
