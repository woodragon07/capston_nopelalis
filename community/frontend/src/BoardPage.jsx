// BoardPage.jsx
import { useState } from "react";

const NOTICES_PER_PAGE = 4;

function BoardPage({ title, data, showWriteButton, onSelectPost, onClickWrite, perPage = NOTICES_PER_PAGE }) {
  const [page, setPage] = useState(1);

  const pageSize = perPage ?? NOTICES_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const visibleItems = data.slice(startIndex, startIndex + pageSize);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handlePrev = () => {
    if (canPrev) setPage(page - 1);
  };

  const handleNext = () => {
    if (canNext) setPage(page + 1);
  };

  const handleWrite = () => {
    if (!showWriteButton) return;
    if (onClickWrite) {
      onClickWrite();
    }
  };

  return (
    <div className='notice-page'>
      <div className="board-header">
        <h2 className='section-title'>{title}</h2>

        {showWriteButton && (
          <button className="write-button" onClick={handleWrite}>
            글쓰기
          </button>
        )}
      </div>

      <ul className='notice-list'>
        {visibleItems.map((item) => (
          <li
            key={item.id}
            className='notice-item'
            onClick={() => onSelectPost && onSelectPost({ id: item.id })}
            style={{ cursor: 'pointer' }}
          >
            <span className='notice-title'>{item.title}</span>
            <span className='notice-date'>{item.date}</span>
          </li>
        ))}
      </ul>

      <div className='notice-pagination'>
        <button
          className='pagination-button'
          onClick={handlePrev}
          disabled={!canPrev}
        >
          이전
        </button>

        <span className="page-info">
          {page} / {totalPages}
        </span>

        <button
          className='pagination-button'
          onClick={handleNext}
          disabled={!canNext}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default BoardPage;
