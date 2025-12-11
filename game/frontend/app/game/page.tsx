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

type ChecklistCategory = 'house' | 'sagi' | 'work';
type ChecklistPage = 'house' | 'sagi' | 'work1' | 'work2';

type ChecklistItem = {
  id: string;
  page: ChecklistPage;
  top: string;   // 체크박스의 세로 위치 (%)
  label: string; // 접근성용 라벨
};

const CHECKLIST_IMAGES: Record<ChecklistPage, string> = {
  house: '/images/check_house.png',
  sagi: '/images/check_sagi.png',
  work1: '/images/check_work1.png',
  work2: '/images/check_work2.png',
};

// 체크박스 이미지 (빈 박스 / 체크된 박스)
const CHECKBOX_IMAGES = {
  unchecked: '/images/check_empty.png',
  checked: '/images/check_checked.png',
} as const;

// 각 페이지별 체크박스 위치 (top 값은 화면 보면서 미세조정)
const CHECKLIST_ITEMS: Record<ChecklistPage, ChecklistItem[]> = {
  house: [
    { id: 'house-1', page: 'house', top: '15%', label: '주거 1' },
    { id: 'house-2', page: 'house', top: '21%', label: '주거 2' },
    { id: 'house-3', page: 'house', top: '27%', label: '주거 3' },
    { id: 'house-4', page: 'house', top: '35%', label: '주거 4' },
    { id: 'house-5', page: 'house', top: '40.5%', label: '주거 5' },
    { id: 'house-6', page: 'house', top: '47%', label: '주거 6' },
    { id: 'house-7', page: 'house', top: '53%', label: '주거 7' },
    { id: 'house-8', page: 'house', top: '59%', label: '주거 8' },
    { id: 'house-9', page: 'house', top: '65%', label: '주거 9' },
    { id: 'house-10', page: 'house', top: '72.6%', label: '주거 10' },
    { id: 'house-11', page: 'house', top: '79%', label: '주거 11' },
  ],
  sagi: [
    { id: 'sagi-1', page: 'sagi', top: '14%', label: '사기1' },
    { id: 'sagi-2', page: 'sagi', top: '21%', label: '사기2' },
    { id: 'sagi-3', page: 'sagi', top: '27.5%', label: '사기3' },
    { id: 'sagi-4', page: 'sagi', top: '34%', label: '사기4' },
    { id: 'sagi-5', page: 'sagi', top: '41%', label: '사기5' },
    { id: 'sagi-6', page: 'sagi', top: '47.3%', label: '사기6' },
    { id: 'sagi-7', page: 'sagi', top: '53%', label: '사기7' },
    { id: 'sagi-8', page: 'sagi', top: '60%', label: '사기8' },
    { id: 'sagi-9', page: 'sagi', top: '66%', label: '사기9' },
  ],
  work1: [
    { id: 'work1-1', page: 'work1', top: '14%', label: '근로 체크 1' },
    { id: 'work1-2', page: 'work1', top: '21%', label: '근로 체크 2' },
    { id: 'work1-3', page: 'work1', top: '27.5%', label: '근로 체크 3' },
    { id: 'work1-4', page: 'work1', top: '34%', label: '근로 체크 4' },
    { id: 'work1-5', page: 'work1', top: '40%', label: '근로 체크 5' },
    { id: 'work1-6', page: 'work1', top: '47%', label: '근로 체크 6' },
    { id: 'work1-7', page: 'work1', top: '53%', label: '근로 체크 7' },
    { id: 'work1-8', page: 'work1', top: '59%', label: '근로 체크 8' },
    { id: 'work1-9', page: 'work1', top: '66%', label: '근로 체크 9' },
    { id: 'work1-10', page: 'work1', top: '72%', label: '근로 체크 10' },
  ],
  work2: [
    { id: 'work2-1', page: 'work2', top: '14%', label: '근로 체크 11' },
    { id: 'work2-2', page: 'work2', top: '21%', label: '근로 체크 12' },
    { id: 'work2-3', page: 'work2', top: '28%', label: '근로 체크 13' },
    { id: 'work2-4', page: 'work2', top: '34.5%', label: '근로 체크 14' },
  ],
};

export default function GameScreen() {
  const [currentTab, setCurrentTab] = useState<TabType>('document');
  const [currentCaseId, setCurrentCaseId] = useState(1);
  const [gameState, setGameState] = useState<GameState>('case-selection');

  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [checklistCategory, setChecklistCategory] =
    useState<ChecklistCategory>('house');
  const [workPage, setWorkPage] = useState<1 | 2>(1);

  // 체크박스 on/off 상태
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const selectedCase: CaseData =
    CASES.find((c) => c.id === currentCaseId) ?? CASES[0];

  const isGameActive = gameState === 'playing';

  const handleCaseSelect = (id: number) => {
    setCurrentCaseId(id);
    setGameState('intro');
  };

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleVerdict = (verdict: 'guilty' | 'innocent') => {
    if (!isGameActive) return;

    const isCorrect =
      (verdict === 'innocent' && selectedCase.is_innocent) ||
      (verdict === 'guilty' && !selectedCase.is_innocent);

    if (isCorrect) {
      alert('🎉 정답입니다!');
    } else {
      alert('❌ 오답입니다!');
    }
    setCheckedItems({});
  };

  // 체크박스 토글
  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
            className={`case-select-btn ${
              currentCaseId === c.id
                ? 'case-select-btn--active'
                : 'case-select-btn--inactive'
            }`}
          >
            CASE {c.id} : {c.summary}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (gameState !== 'playing') return null;

    const {
      document: DocumentComp,
      sns: SNSComp,
      video: VideoComp,
      etc: EtcComp,
    } = selectedCase.contents;

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
          ${
            currentTab === tab && isGameActive
              ? 'shadow-[0_0_20px_rgba(255,255,255,0.8)] opacity-100'
              : 'opacity-50'
          }
        `}
        style={{ top }}
      >
        {name}
      </button>
    ));

  const renderChecklist = () => {
    if (!isChecklistOpen) return null;

    const checklistSrc =
      checklistCategory === 'house'
        ? CHECKLIST_IMAGES.house
        : checklistCategory === 'sagi'
        ? CHECKLIST_IMAGES.sagi
        : workPage === 1
        ? CHECKLIST_IMAGES.work1
        : CHECKLIST_IMAGES.work2;

    // 현재 실제 페이지 (근로는 work1 / work2)
    const currentPage: ChecklistPage =
      checklistCategory === 'house'
        ? 'house'
        : checklistCategory === 'sagi'
        ? 'sagi'
        : workPage === 1
        ? 'work1'
        : 'work2';

    const items = CHECKLIST_ITEMS[currentPage];

    const showHouseChecklist = () => {
      setChecklistCategory('house');
      setWorkPage(1);
    };

    const showSagiChecklist = () => {
      setChecklistCategory('sagi');
      setWorkPage(1);
    };

    const showWorkChecklist = () => {
      setChecklistCategory('work');
      setWorkPage(1);
    };

    const goWorkPage = (page: 1 | 2) => {
      setChecklistCategory('work');
      setWorkPage(page);
    };

    return (
      <div className="checklist-panel" aria-label="체크리스트">
        {/* 배경 체크리스트 이미지 */}
        <Image
          src={checklistSrc}
          alt="체크리스트"
          fill
          className="object-contain"
          priority
        />

        {/* 각 줄 왼쪽 체크박스 */}
        {items.map((item) => {
          const isChecked = !!checkedItems[item.id];
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`${item.label} 체크`}
              className="checklist-checkbox"
              style={{ top: item.top }}
              onClick={() => toggleChecklistItem(item.id)}
            >
              <Image
                src={
                  isChecked ? CHECKBOX_IMAGES.checked : CHECKBOX_IMAGES.unchecked
                }
                alt={isChecked ? '체크됨' : '체크 안 됨'}
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </button>
          );
        })}

        {/* 주거 / 사기 / 근로 탭 */}
        <button
          type="button"
          aria-label="주거 체크리스트"
          className="checklist-tab checklist-tab--house"
          onClick={showHouseChecklist}
        />
        <button
          type="button"
          aria-label="사기 체크리스트"
          className="checklist-tab checklist-tab--sagi"
          onClick={showSagiChecklist}
        />
        <button
          type="button"
          aria-label="근로 체크리스트"
          className="checklist-tab checklist-tab--work"
          onClick={showWorkChecklist}
        />

        {/* 근로일 때만 페이지 이동 화살표 */}
        {checklistCategory === 'work' && (
          <>
            <button
              type="button"
              aria-label="이전 근로 체크리스트"
              className="checklist-arrow checklist-arrow--prev"
              onClick={() => goWorkPage(1)}
              disabled={workPage === 1}
            />
            <button
              type="button"
              aria-label="다음 근로 체크리스트"
              className="checklist-arrow checklist-arrow--next"
              onClick={() => goWorkPage(2)}
              disabled={workPage === 2}
            />
          </>
        )}
      </div>
    );
  };

  const renderVerdictButtons = () => (
    <>
      <button
        onClick={() => handleVerdict('guilty')}
        disabled={!isGameActive}
        className={`game-button z-20 ${
          !isGameActive ? 'game-button-disabled' : 'game-button-hover'
        }`}
        style={VERDICT_BUTTONS.guilty}
      />
      <button
        onClick={() => handleVerdict('innocent')}
        disabled={!isGameActive}
        className={`game-button z-20 ${
          !isGameActive ? 'game-button-disabled' : 'game-button-hover'
        }`}
        style={VERDICT_BUTTONS.innocent}
      />
    </>
  );

  const renderIntroModal = () => (
    <div className="game-intro-overlay">
      <div className="game-intro-box">
        <div className="mb-4 text-2xl font-bold font-bm">
          {selectedCase.characterName}
        </div>
        <div className="text-lg leading-relaxed mb-6 font-bm">
          {selectedCase.introScript}
        </div>
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
      {/* 체크리스트 열기 버튼 */}
      <button
        type="button"
        className="game-button checklist-button relative game-button-hover"
        aria-label="체크리스트"
        onClick={() => {
          setIsChecklistOpen((prev) => {
            const next = !prev;
            if (next) {
              setChecklistCategory('house');
              setWorkPage(1);
            }
            return next;
          });
        }}
      >
        <Image
          src="/images/checklist-button.png"
          alt="체크리스트"
          fill
          className="object-contain"
        />
      </button>

      {renderChecklist()}

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
        {gameState === 'case-selection'
          ? renderCaseSelection()
          : renderTabContent()}
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
