'use client';

import { useState } from 'react';
import Image from 'next/image';
import DocumentContent, { TAB_NAME as DOC_NAME } from './components/DocumentContent';
import SNSContent, { TAB_NAME as SNS_NAME } from './components/SNSContent';
import VideoContent, { TAB_NAME as VIDEO_NAME } from './components/VideoContent';
import EtcContent, { TAB_NAME as ETC_NAME } from './components/EtcContent';

type TabType = 'document' | 'sns' | 'video' | 'etc';

export default function GameScreen() {
  const [currentTab, setCurrentTab] = useState<TabType>('document');

  const gilty = () => {
    alert("gilty!!!")
  }
  const innocent = () => {
    alert("innocent!!!")
  }

  const renderContent = () => {
    switch(currentTab) {
      case 'document':
        return <DocumentContent />;
      case 'sns':
        return <SNSContent />;
      case 'video':
        return <VideoContent />;
      case 'etc':
        return <EtcContent />;
      default:
        return <DocumentContent />;
    }
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
          src="/images/game-background.png"
          alt="Game Background"
          fill
          className="object-contain select-none pointer-events-none"
          priority
          quality={100}
        />

        {/* 중앙 콘텐츠 영역 */}
        <div className="absolute" style={{
          top: '11.8%',
          left: '31.7%',
          width: '58.4%',
          height: '73%',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 13.4% 100%, 0 81%)'
        }}>
          {renderContent()}
        </div>

        {/* 4개의 메뉴 버튼 */}
        <button
          onClick={() => setCurrentTab('document')}
          className={`absolute cursor-pointer transition-all duration-300
            ${currentTab === 'document' ? 'bg-black/25' : ''}`}
          style={{
            top: '17%',
            right: '6.8%',
            width: '3%',
            height: '15%',
            writingMode: 'vertical-rl',
            fontSize: '1.2vw',
            fontFamily: 'var(--font-bm)',
            clipPath: 'polygon(0 0, 100% 10%, 100% 90%, 0% 100%)',
          }}
        >
          {DOC_NAME}
        </button>
        <button
          onClick={() => setCurrentTab('sns')}
          className={`absolute cursor-pointer transition-all duration-300 hover:brightness-110  ${
            currentTab === 'sns' ? 'brightness-125' : ''
          }`}
          style={{
            top: '30%',
            right: '2%',
            width: '7%',
            height: '12%',
            fontSize: '1.2vw',
          }}
        >
          {SNS_NAME}
        </button>
        <button
          onClick={() => setCurrentTab('video')}
          className={`absolute cursor-pointer transition-all duration-300 hover:brightness-110 text-white ${
            currentTab === 'video' ? 'brightness-125' : ''
          }`}
          style={{
            top: '45%',
            right: '2%',
            width: '7%',
            height: '12%',
            fontSize: '1.2vw',
          }}
        >
          {VIDEO_NAME}
        </button>
        <button
          onClick={() => setCurrentTab('etc')}
          className={`absolute cursor-pointer transition-all duration-300 hover:brightness-110 text-white ${
            currentTab === 'etc' ? 'brightness-125' : ''
          }`}
          style={{
            top: '60%',
            right: '2%',
            width: '7%',
            height: '12%',
            fontSize: '1.2vw',
          }}
        >
          {ETC_NAME}
        </button>


        {/* 유죄 무죄 버튼 */}
        <button
        onClick={gilty}
        className="absolute cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] hover:brightness-110"
        style={{
          top: '57.7%',
          right: '84.1%',
          width: '10.3%',
          height: '6.4%'
        }}
        />
        <button
        onClick={innocent}
        className="absolute cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] hover:brightness-110"
        style={{
          top: '57.7%',
          right: '72.4%',
          width: '10.3%',
          height: '6.4%'
        }}
        />

        {/* 4개의 메뉴 버튼 (오른쪽) */}
        <button
          onClick={() => setCurrentTab('document')}
          className={`absolute cursor-pointer transition-all duration-300 hover:brightness-110 ${
            currentTab === 'document' ? 'brightness-125' : ''
          }`}
          style={{
            top: '15%',
            right: '2%',
            width: '7%',
            height: '12%'
          }}
        />
        <button
          onClick={() => setCurrentTab('sns')}
          className={`absolute cursor-pointer transition-all duration-300 hover:brightness-110 ${
            currentTab === 'sns' ? 'brightness-125' : ''
          }`}
          style={{
            top: '30%',
            right: '2%',
            width: '7%',
            height: '12%'
          }}
        />
        <button
          onClick={() => setCurrentTab('video')}
          className={`absolute cursor-pointer transition-all duration-300 hover:brightness-110 ${
            currentTab === 'video' ? 'brightness-125' : ''
          }`}
          style={{
            top: '45%',
            right: '2%',
            width: '7%',
            height: '12%'
          }}
        />
        <button
          onClick={() => setCurrentTab('etc')}
          className={`absolute cursor-pointer transition-all duration-300 hover:brightness-110 ${
            currentTab === 'etc' ? 'brightness-125' : ''
          }`}
          style={{
            top: '60%',
            right: '2%',
            width: '7%',
            height: '12%'
          }}
        />


      </div>
    </div>
  );
}