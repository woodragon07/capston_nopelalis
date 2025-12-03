'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CASES, type CaseData, type TabType } from './cases';

const MENU_BUTTONS: { tab: TabType; name: string; top: string }[] = [
  { tab: 'document', name: '문서', top: '19.5%' },
  { tab: 'sns', name: 'SNS', top: '36.3%' },
  { tab: 'video', name: '영상', top: '53.3%' },
  { tab: 'etc', name: '기타', top: '70%' },
];

const VERDICT_BUTTONS = {
  guilty: { top: '57.7%', right: '84.1%', width: '10.3%', height: '6.4%' },
  innocent: { top: '57.7%', right: '72.4%', width: '10.3%', height: '6.4%' },
} as const;

type GameState = 'case-selection' | 'intro' | 'playing';

export default function GameScreen() {
  const [currentTab, setCurrentTab] = useState<TabType>('document');
  const [currentCaseId, setCurrentCaseId] = useState(1);
  const [gameState, setGameState] = useState<GameState>('case-selection');

  const selectedCase: CaseData = CASES.find((c) => c.id === currentCaseId) ?? CASES[0];

  const isGameActive = gameState === 'playing';

  // 핸들러들 통합
  const handleCaseSelect = (id: number) => {
    setCurrentCaseId(id);
    setGameState('intro');
  };

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleVerdict = (verdict: 'guilty' | 'innocent') => {
    if (!isGameActive) return;

    const isCorrect = (verdict === 'innocent' && selectedCase.is_innocent) ||
    (verdict === 'guilty' && !selectedCase.is_innocent);

    if (isCorrect) {
      alert('🎉 정답입니다!');
    } else {
      alert('❌ 오답입니다!');
    }
  };

  const renderCaseSelection = () => (
    <div className="relative w-full h-full">
      <div
        className="absolute flex flex-col gap-[6%]"
        style={{
          top: '23%',
          left: '53%',
          width: '75%',
          height: '60%',
          transform: 'translateX(-50%)',
        }}
      >
        {CASES.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCaseSelect(c.id)}
            className={`
              case-select-btn
              ${currentCaseId === c.id ? 'case-select-btn--active' : 'case-select-btn--inactive'}
            `}
          >
            CASE {c.id} : {c.summary}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (gameState !== 'playing') return null;

    const { document: DocumentComp, sns: SNSComp, video: VideoComp, etc: EtcComp } = selectedCase.contents;
    
    return (
      <>
        {currentTab === 'document' && <DocumentComp />}
        {currentTab === 'sns' && <SNSComp />}
        {currentTab === 'video' && <VideoComp />}
        {currentTab === 'etc' && <EtcComp />}
      </>
    );
  };

  const renderTabButtons = () =>
    MENU_BUTTONS.map(({ tab, name, top }) => (
      <button
        key={`tab-${tab}`}
        onClick={() => isGameActive && setCurrentTab(tab)}
        disabled={!isGameActive}
        className={`
          game-button menu-button-text game-tab-button font-bold
          ${!isGameActive ? 'game-button-disabled' : 'game-button-hover'}
          ${currentTab === tab && isGameActive ? 'shadow-[0_0_20px_rgba(255,255,255,0.8)] opacity-100' : 'opacity-50'}
        `}
        style={{ top }}
      >
        {name}
      </button>
    ));

  const renderVerdictButtons = () => (
    <>
      <button
        onClick={() => handleVerdict('guilty')}
        disabled={!isGameActive}
        className={`game-button z-20 ${!isGameActive ? 'game-button-disabled' : 'game-button-hover'}`}
        style={VERDICT_BUTTONS.guilty}
      />
      <button
        onClick={() => handleVerdict('innocent')}
        disabled={!isGameActive}
        className={`game-button z-20 ${!isGameActive ? 'game-button-disabled' : 'game-button-hover'}`}
        style={VERDICT_BUTTONS.innocent}
      />
    </>
  );

  const renderIntroModal = () => (
    <div className="game-intro-overlay">
      <div className="game-intro-box">
        <div className="mb-4 text-2xl font-bold font-bm">{selectedCase.characterName}</div>
        <div className="text-lg leading-relaxed mb-6 font-bm">{selectedCase.introScript}</div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setGameState('case-selection')}
            className="px-4 py-2 border border-white/30 text-white rounded hover:bg-neutral-900 font-bm"
          >
            나중에 보기
          </button>
          <button
            onClick={handleStartGame}
            className="px-6 py-2 bg-white text-black rounded font-bold font-bm game-button-hover"
          >
            사건 시작
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 캐릭터 이미지 */}
      {isGameActive && (
        <div
          className="absolute"
          style={{ bottom: '52.4%', left: '1%', width: '31%', height: '31%' }}
        >
          <Image
            src={selectedCase.characterImage}
            alt={selectedCase.characterName}
            fill
            className="object-contain"
          />
        </div>
      )}

      {/* 메인 패널 */}
      <div className="game-main-panel">
        {gameState === 'case-selection' ? renderCaseSelection() : renderTabContent()}
      </div>

      {/* 탭 버튼들 */}
      {renderTabButtons()}

      {/* 판결 버튼들 */}
      {renderVerdictButtons()}

      {/* 인트로 모달 */}
      {gameState === 'intro' && renderIntroModal()}
    </>
  );
}
