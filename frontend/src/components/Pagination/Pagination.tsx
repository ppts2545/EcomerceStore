import React from "react";
import "./Pagination.css";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  windowSize?: number; // จำนวนเลขหน้าต่างๆ ที่โชว์กลางๆ (5 แนะนำ)
};

const buildPages = (current: number, total: number, win = 5): (number | "…")[] => {
  const half = Math.floor(win / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + win - 1);
  start = Math.max(1, Math.min(start, end - win + 1));

  const center: number[] = [];
  for (let i = start; i <= end; i++) center.push(i);

  const out: (number | "…")[] = [];
  if (start > 1) {
    out.push(1);
    if (start > 2) out.push("…");
  }
  out.push(...center);
  if (end < total) {
    if (end < total - 1) out.push("…");
    out.push(total);
  }
  return out;
};

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange, windowSize = 5 }) => {
  // ไม่ซ่อน แม้จะมีแค่ 1 หน้า
  const pages = buildPages(currentPage, totalPages, windowSize);

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange(p);
  };

  return (
    <nav className="pg" aria-label="Pagination Navigation">
      <button
        className="pg__btn"
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="ย้อนกลับ"
      >
        ‹
      </button>

      <ul className="pg__list">
        {pages.map((p, idx) =>
          p === "…" ? (
            <li key={`dots-${idx}`} className="pg__dots" aria-hidden>…</li>
          ) : (
            <li key={p}>
              <button
                className={`pg__num ${p === currentPage ? "is-active" : ""}`}
                onClick={() => go(p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            </li>
          )
        )}
      </ul>

      <button
        className="pg__btn"
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="หน้าถัดไป"
      >
        ›
      </button>
    </nav>
  );
};

export default Pagination;