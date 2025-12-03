// app/game/cases/index.ts
export type TabType = 'document' | 'sns' | 'video' | 'etc';

// 각 탭에 React 컴포넌트 타입을 저장
export interface CaseContents {
  document: React.ComponentType;
  sns: React.ComponentType;
  video: React.ComponentType;
  etc: React.ComponentType;
}

export interface CaseData {
  id: number;
  title: string;
  summary: string;
  characterName: string;
  characterImage: string;
  statusText?: string;
  is_innocent: boolean;
  introScript: string;
  contents: CaseContents;
}

// case1 import
import { case1 } from './case1';

export const CASES: CaseData[] = [case1];
