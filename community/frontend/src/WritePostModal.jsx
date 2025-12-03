import { useRef, useState } from "react";

function WritePostModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("");

  const fileInputRef = useRef(null);

  const TITLE_LIMIT = 20;

  if (!open) return null;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageName(file.name);
    } else {
      setImageFile(null);
      setImageName("");
    }
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setImageFile(null);
    setImageName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    onSubmit?.({
      title: trimmedTitle,
      content: trimmedContent,
      image: imageFile,
    });

    // 초기화 + 닫기
    handleReset();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="write-modal"
        onClick={(e) => e.stopPropagation()} // 안쪽 클릭 시 닫히지 않게
      >
        {/* 상단 헤더 */}
        <div className="write-header">
          <h2 className="write-title">유저 커뮤니티 글쓰기</h2>
          <button
            type="button"
            className="write-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 폼 영역 */}
        <form className="write-form" onSubmit={handleSubmit}>
          {/* 제목 */}
          <div className="write-field">
            <div className="write-field-header">
              <span className="write-placeholder">제목을 입력해주세요</span>
              <span className="write-counter">
                {title.length}/{TITLE_LIMIT}
              </span>
            </div>
            <input
              className="write-title-input"
              type="text"
              maxLength={TITLE_LIMIT}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="write-underline" />
          </div>

          {/* 내용 */}
          <div className="write-field">
            <textarea
              className="write-textarea"
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 하단 바 */}
          <div className="write-footer">
            <div className="write-footer-left">
              {/* 아이콘들 – 지금은 디자인용 더미 */}
              <button type="button" className="write-icon-btn">
                🔒
              </button>
              <button
                type="button"
                className="write-icon-btn"
                onClick={handleReset}
              >
                🧹
              </button>
              <button
                type="button"
                className="write-icon-btn"
                onClick={handleImageClick}
              >
                🖼️
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              {imageName && (
                <span className="write-selected-image">{imageName}</span>
              )}
            </div>

            <button type="submit" className="write-submit-btn">
              <span>업로드 하기</span>
              <span className="write-submit-icon">✈️</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WritePostModal;
