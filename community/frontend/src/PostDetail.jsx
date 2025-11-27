import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8000";

function PostDetail({ post, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/community/posts/${post.postId || post.id}`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("게시글 상세 조회 실패:", err);
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [post.postId, post.id]);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>데이터 없음</p>;

  return (
    <div className="post-detail">
      <button className="back-btn" onClick={onBack}>← 목록으로</button>

      <h1 className="post-title">{data.title}</h1>

      <div className="post-meta">
        <span>작성자 : {data.nickname}</span>
      </div>

      {data.imageUrl && (
        <img
          src={`${API_BASE_URL}${data.imageUrl}`}
          alt=""
          className="post-image"
        />
      )}

      <div className="post-content">
        <p>{data.body}</p>
      </div>

      <div className="comments">
        <h3>{data.comments.length}개의 댓글</h3>

        {data.comments.map((c) => (
          <div key={c.commentId} className="comment">
            <p>{c.body}</p>
            <p className="comment-meta">
              {c.nickname} · {c.createdAt.slice(0, 10)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostDetail;
