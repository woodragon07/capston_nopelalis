import { useState, useEffect } from 'react'
import './App.css'
import BoardPage from './BoardPage';
import PostDetail from './PostDetail';
import WritePostModal from './WritePostModal';
import { auth } from "./firebase"; 
import { API_BASE_URL, toAbsoluteUrl } from "./apiConfig";

const NOTICES_PER_PAGE = 4;

const NOTICE_DATA = [
  { id: 1, title: '11월 3주차 정기 점검 안내', date: '2025-11-15' },
  { id: 2, title: '커뮤니티 운영 수칙 안내', date: '2025-11-13' },
  { id: 3, title: '서비스 이용약관 개정 사전 안내', date: '2025-11-13' },
  { id: 4, title: '게임 안정화를 위한 업데이트 v01-2', date: '2025-11-13' },
  { id: 5, title: '11월 2주차 정기 점검 안내', date: '2025-11-12' },
  { id: 6, title: '게임 안정화를 위한 업데이트 v01-1', date: '2025-11-11' },
];

function App() {
  const [selectedMenu, setSelectedMenu] = useState("notice");
  const [selectedPost, setSelectedPost] = useState(null);

  // 커뮤 글 리스트
  const [communityData, setCommunityData] = useState([]);

  // 커뮤 글 불러오기 에러상태
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState(null);

  // 모달 상태
  const [isWriteOpen, setIsWriteOpen] = useState(false);

  const handleSelectedPost = (post) => {
    setSelectedPost({ postId: post.id });
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  const handleCommentAdded = (postId) => {
    setCommunityData((prev) =>
      prev.map((item) =>
        item.id === postId
          ? { ...item, commentCount: (item.commentCount || 0) + 1 }
          : item
      )
    );
  };

  const handleOpenWrite = () => {
    setIsWriteOpen(true);
  };

  const handleCloseWrite = () => {
    setIsWriteOpen(false);
  };

  // ✅ 글쓰기 (토큰 + 백엔드 연동)
  const handleSubmitWrite = async ({ title, content, image }) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const form = new FormData();
      form.append("nickname", "가연"); // 임시
      form.append("title", title);
      form.append("body", content);
      if (image) form.append("image", image);

      const res = await fetch(`${API_BASE_URL}/community/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP 오류: ${res.status} ${t}`);
      }

      const created = await res.json();

      const mapped = {
        id: created.postId,
        title: created.title,
        date: created.createdAt.slice(0, 10),
        nickname: created.nickname,
        commentCount: (created.comments || []).length,
        imageUrl: toAbsoluteUrl(created.imageUrl),
      };

      setCommunityData((prev) => [mapped, ...prev]);
    } catch (err) {
      console.error("글 작성 실패:", err);
      alert("글을 저장하는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (selectedMenu !== "community") return;

    const fetchCommunity = async () => {
      try {
        setCommunityLoading(true);
        setCommunityError(null);

        const res = await fetch(
          `${API_BASE_URL}/community/posts?page=1&page_size=20`
        );

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${t}`);
        }

        const data = await res.json();

        const mapped = (data.items || []).map((item) => ({
          id: item.postId,
          title: item.title,
          date: item.createdAt.slice(0, 10),
          nickname: item.nickname,
          commentCount: item.commentCount,
          imageUrl: toAbsoluteUrl(item.imageUrl),
        }));

        setCommunityData(mapped);
      } catch (err) {
        console.error("커뮤니티 목록 불러오기 실패:", err);
        setCommunityError("커뮤니티 글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setCommunityLoading(false);
      }
    };

    fetchCommunity();
  }, [selectedMenu]);

  const currentData =
    selectedMenu === 'notice' ? NOTICE_DATA :
      selectedMenu === 'community' ? communityData :
        [];

  const currentTitle =
    selectedMenu === 'notice' ? '공지사항' :
      selectedMenu === 'community' ? '커뮤니티' :
        '제작자 정보';

  const showWriteButton = selectedMenu === 'community';

  return (
    <div className='page'>
      <aside className='left-panel'>
        <div className='left-header'>
          <img src="/please.png" alt="title" className='title-image' />
        </div>

        <nav className='menu'>
          <button
            className={selectedMenu === "notice" ? "menu-button active" : "menu-button"}
            onClick={() => { setSelectedMenu("notice"); setSelectedPost(null); }}
          >
            공지사항
          </button>
          <button
            className={selectedMenu === "community" ? "menu-button active" : "menu-button"}
            onClick={() => { setSelectedMenu("community"); setSelectedPost(null); }}
          >
            유저 커뮤니티
          </button>
          <button
            className={selectedMenu === "about" ? "menu-button active" : "menu-button"}
            onClick={() => { setSelectedMenu("about"); setSelectedPost(null); }}
          >
            제작자 정보
          </button>
        </nav>
      </aside>

      <main className='main-panel'>
        {selectedMenu === "about" ? (
          <section>
            <h2 className='main-title'>제작자 정보</h2>
          </section>
        ) : selectedPost ? (
          <PostDetail
            post={selectedPost}
            onBack={handleBackToList}
            onCommentAdded={handleCommentAdded}
          />
        ) : selectedMenu === "community" ? (
          communityLoading ? (
            <p>커뮤니티 글을 불러오는 중입니다...</p>
          ) : communityError ? (
            <p>{communityError}</p>
          ) : (
            <BoardPage
              title={currentTitle}
              data={currentData}
              showWriteButton={showWriteButton}
              onSelectPost={handleSelectedPost}
              onClickWrite={handleOpenWrite}
              perPage={NOTICES_PER_PAGE}
            />
          )
        ) : (
          <BoardPage
            title={currentTitle}
            data={currentData}
            showWriteButton={false}
            onSelectPost={handleSelectedPost}
            onClickWrite={handleOpenWrite}
            perPage={NOTICES_PER_PAGE}
          />
        )}
      </main>

      <WritePostModal
        open={isWriteOpen}
        onClose={handleCloseWrite}
        onSubmit={handleSubmitWrite}
      />
    </div>
  );
}

export default App;
