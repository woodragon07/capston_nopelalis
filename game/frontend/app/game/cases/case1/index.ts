// app/game/cases/case1/index.ts
import type { CaseData } from '../index';
import Case1Document from './document';
import Case1SNS from './sns';
import Case1Video from './video';
import Case1Etc from './etc';

export const case1: CaseData = {
  id: 1,
  title: '사건번호 1',
  summary: '길동의 전세사기',
  characterName: '홍길동',
  characterImage: '/images/cases/case1/character.png',
  statusText: 'status: 안정',
  is_innocent: true,
  introScript:
    '저는 첫 번째 사건의 피의자 홍길동입니다. 최근에 이런 일들이 있었어요. 그날 이후로 제 삶이 완전히 달라졌습니다. 당신이 제 이야기를 듣고 판단해 주세요.',
  contents: {
    document: Case1Document,  
    sns: Case1SNS,
    video: Case1Video,
    etc: Case1Etc,
  },
};
