import { useEffect, useState } from "react";
import { API_BASE_URL, toAbsoluteUrl } from "./apiConfig";

function PostDetail({ post, onBack, onCommentAdded, getToken }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      const token = await getToken?.();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      setSubmitting(true);
      const res = await fetch(
        `${API_BASE_URL}/community/posts/${post.postId || post.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nickname: "가연",
            body: commentText,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const created = await res.json();
      setData((prev) => ({
        ...prev,
        comments: [...(prev?.comments || []), created],
      }));
      setCommentText("");
      onCommentAdded?.(post.postId || post.id);
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="post-image-wrapper">
          <img
            src={toAbsoluteUrl(data.imageUrl)}
            alt=""
            className="post-image"
          />
        </div>
      )}

      <div className="post-content">
        <p>{data.body}</p>
      </div>

      <div className="comments">
        <h3>{data.comments.length}개의 댓글</h3>

        {data.comments.map((c) => (
          <div key={c.commentId} className="comment">
            <p className="comment-body">{c.body}</p>
            <p className="comment-meta">
              {c.nickname} · {c.createdAt.slice(0, 10)}
            </p>
          </div>
        ))}

        <div className="comment-input">
          <textarea
            placeholder="댓글을 입력하세요"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={submitting}
            rows={3}
          />
          <button type="button" onClick={handleSubmitComment} disabled={submitting}>
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
