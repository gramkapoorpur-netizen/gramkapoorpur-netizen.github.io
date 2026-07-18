import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, MapPin, Share2, UserRound, Volume2 } from "lucide-react";

function assetUrl(path) {
  if (!path) return "";
  if (/^https?:/i.test(path) || path.startsWith("data:")) return path;
  return `${import.meta.env.BASE_URL}${path}`.replace(/\/\.\//g, "/");
}

function shareText(item) {
  return `${item.titleHi}\n\n${item.descriptionHi}\n\nKapoorpur Memory Gallery`;
}

export default function CinematicMemoryBook({ memories, lang = "hi", onSpeak }) {
  const approvedMemories = useMemo(() => memories.filter((item) => item.approved !== false), [memories]);
  const [pageIndex, setPageIndex] = useState(0);
  const [turning, setTurning] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  const current = approvedMemories[pageIndex];
  const total = approvedMemories.length;

  useEffect(() => {
    if (pageIndex > Math.max(total - 1, 0)) {
      setPageIndex(Math.max(total - 1, 0));
    }
  }, [pageIndex, total]);

  function turn(direction) {
    if (!total) return;
    const nextIndex = direction === "next" ? Math.min(pageIndex + 1, total - 1) : Math.max(pageIndex - 1, 0);
    if (nextIndex === pageIndex) return;
    setTurning(direction);
    window.setTimeout(() => {
      setPageIndex(nextIndex);
      setTurning("");
      setShareStatus("");
    }, 260);
  }

  async function shareMemory() {
    if (!current) return;
    const text = shareText(current);
    const url = `${window.location.origin}${window.location.pathname}#memories`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: lang === "hi" ? current.titleHi : current.titleEn,
          text,
          url,
        });
        setShareStatus("Memory share हो गई।");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareStatus("Share text copy हो गया।");
        return;
      }

      setShareStatus("इस मोबाइल में share support नहीं है।");
    } catch {
      setShareStatus("Share cancel हो गया।");
    }
  }

  if (!current) {
    return null;
  }

  return (
    <section className="cinematic-book-section" aria-labelledby="memory-book-title">
      <div className="section-heading compact-heading">
        <span className="eyebrow">Cinematic Memory Book</span>
        <h2 id="memory-book-title">यादों की किताब</h2>
        <p>पुरानी यादों को किताब की तरह पलटें, सुनें और परिवार के साथ share करें।</p>
      </div>

      <div className={`memory-book-stage ${turning ? `is-turning-${turning}` : ""}`}>
        <div className="book-glow" aria-hidden="true" />
        <article className="memory-book" aria-live="polite">
          <div className="book-page book-photo-page">
            <div className="book-cover-mark">
              <BookOpen size={18} />
              Kapoorpur
            </div>
            <img src={assetUrl(current.image)} alt={lang === "hi" ? current.titleHi : current.titleEn} />
            <span className="book-year">{current.year}</span>
          </div>

          <div className="book-spine" aria-hidden="true" />

          <div className="book-page book-story-page">
            <span className="category-pill">Memory Gallery</span>
            <h3>{lang === "hi" ? current.titleHi : current.titleEn}</h3>
            <p>{lang === "hi" ? current.descriptionHi : current.descriptionEn}</p>
            <div className="detail-meta">
              <span>
                <CalendarDays size={16} />
                {current.year}
              </span>
              <span>
                <UserRound size={16} />
                {current.person}
              </span>
              <span>
                <MapPin size={16} />
                {current.location}
              </span>
            </div>
            <div className="book-actions">
              <button className="icon-button primary" type="button" onClick={() => onSpeak(`${current.titleHi}. ${current.descriptionHi}`)}>
                <Volume2 size={18} />
                सुनें
              </button>
              <button className="icon-button" type="button" onClick={shareMemory}>
                <Share2 size={18} />
                Share
              </button>
            </div>
            {shareStatus ? <p className="book-share-status">{shareStatus}</p> : null}
          </div>

          <div className="turning-page" aria-hidden="true" />
        </article>

        <button
          className="book-turn-button left"
          type="button"
          onClick={() => turn("prev")}
          disabled={pageIndex === 0}
          aria-label="Previous memory"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="book-turn-button right"
          type="button"
          onClick={() => turn("next")}
          disabled={pageIndex === total - 1}
          aria-label="Next memory"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="book-progress" aria-label="Memory book page progress">
        <span>
          Page {pageIndex + 1} / {total}
        </span>
        <div>
          {approvedMemories.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === pageIndex ? "active" : ""}
              onClick={() => {
                if (index === pageIndex) return;
                setTurning(index > pageIndex ? "next" : "prev");
                window.setTimeout(() => {
                  setPageIndex(index);
                  setTurning("");
                  setShareStatus("");
                }, 260);
              }}
              aria-label={`Open memory page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
