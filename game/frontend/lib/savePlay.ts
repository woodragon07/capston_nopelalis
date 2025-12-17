import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type PlayCasePayload = {
  // 스샷 필드 기준
  avgTimeSeconds: number;     // 13
  clearCount: number;         // 1
  playCount: number;          // 1
  judge: boolean;             // true/false
  startTime: string;          // ISO string
  endTime: string;            // ISO string
};

function getUidFromLocalStorage(): string {
  // SSR 방지 (혹시라도 서버에서 실행되면 터지지 말고 에러로 뱉게)
  if (typeof window === "undefined") return "";

  return (localStorage.getItem("uid") ?? "").trim();
}

/**
 * player_stats/{uid} 문서에 cases[caseId] 형태로 누적 저장
 *  merge:true 로 기존 케이스 유지 + 새 케이스/업데이트 반영
 */
export async function savePlay(uid: string, caseId: string, payload: PlayCasePayload) {
  const cleanUid = uid.trim();
  const cleanCaseId = String(caseId);

  if (!cleanUid) throw new Error("uid is empty");
  if (!cleanCaseId) throw new Error("caseId is empty");

  const ref = doc(db, "player_stats", cleanUid);

  await setDoc(
    ref,
    {
      uid: cleanUid,
      cases: {
        [cleanCaseId]: {
          ...payload,
          caseid: cleanCaseId,
          uid: cleanUid,
          updatedAt: serverTimestamp(),
        },
      },
    },
    { merge: true }
  );
}

/**
 * 게임 쪽에서 uid를 직접 전달하기 귀찮을 때:
 * localStorage의 uid로 저장하는 버전
 */
export async function savePlayFromLocal(caseId: string, payload: PlayCasePayload) {
  const uid = getUidFromLocalStorage();
  if (!uid) throw new Error("No uid in localStorage (uid 저장부터 해야 함)");

  return savePlay(uid, caseId, payload);
}
