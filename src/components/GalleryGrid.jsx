import { CalendarDays, MapPin, UserRound, Volume2 } from "lucide-react";
import { categories } from "../data/sampleGallery";

function assetUrl(path) {
  if (!path) return "";
  if (/^https?:/i.test(path) || path.startsWith("data:")) return path;
  return `${import.meta.env.BASE_URL}${path}`.replace(/\/\.\//g, "/");
}

export default function GalleryGrid({ items, selectedItem, onSelect, onSpeak, lang = "hi" }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <h3>कोई फोटो नहीं मिली</h3>
        <p>दूसरे शब्द, साल, जगह या श्रेणी से खोजकर देखें।</p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-grid">
        {items.map((item) => {
          const category = categories.find((entry) => entry.id === item.category);
          return (
            <article className="gallery-card" key={item.id} onClick={() => onSelect(item)}>
              <div className="media-wrap">
                <img src={assetUrl(item.image)} alt={lang === "hi" ? item.titleHi : item.titleEn} loading="lazy" />
                {item.featured ? <span className="featured-badge">Featured</span> : null}
              </div>
              <div className="card-copy">
                <span className="category-pill">{lang === "hi" ? category?.hi : category?.en}</span>
                <h3>{lang === "hi" ? item.titleHi : item.titleEn}</h3>
                <p>{lang === "hi" ? item.descriptionHi : item.descriptionEn}</p>
                <div className="meta-row">
                  <span>
                    <CalendarDays size={15} />
                    {item.year}
                  </span>
                  <span>
                    <MapPin size={15} />
                    {item.location}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selectedItem ? (
        <div className="modal-backdrop" role="presentation" onClick={() => onSelect(null)}>
          <article className="detail-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" type="button" onClick={() => onSelect(null)} aria-label="Close detail">
              ×
            </button>
            <img src={assetUrl(selectedItem.image)} alt={selectedItem.titleHi} />
            <div className="detail-copy">
              <span className="category-pill">
                {categories.find((entry) => entry.id === selectedItem.category)?.hi || "याद"}
              </span>
              <h2>{lang === "hi" ? selectedItem.titleHi : selectedItem.titleEn}</h2>
              <p>{lang === "hi" ? selectedItem.descriptionHi : selectedItem.descriptionEn}</p>
              <div className="detail-meta">
                <span>
                  <CalendarDays size={16} />
                  {selectedItem.year}
                </span>
                <span>
                  <UserRound size={16} />
                  {selectedItem.person}
                </span>
                <span>
                  <MapPin size={16} />
                  {selectedItem.location}
                </span>
              </div>
              <button
                className="icon-button primary"
                type="button"
                onClick={() => onSpeak(`${selectedItem.titleHi}. ${selectedItem.descriptionHi}`)}
              >
                <Volume2 size={18} />
                हिंदी में सुनें
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
