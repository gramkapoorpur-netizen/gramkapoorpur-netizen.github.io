import { useEffect } from "react";

const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
const slotId = import.meta.env.VITE_ADSENSE_SLOT_ID;

export default function AdSlot({ label = "Advertisement", compact = false }) {
  useEffect(() => {
    if (!clientId || document.querySelector(`script[data-adsense-client="${clientId}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = "anonymous";
    script.dataset.adsenseClient = clientId;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!clientId || !slotId) return;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, []);

  if (!clientId) {
    return (
      <aside className={`ad-slot ad-slot-empty ${compact ? "ad-slot-compact" : ""}`} aria-label={label}>
        <span>AdSense approval के बाद यहां विज्ञापन दिखेंगे</span>
      </aside>
    );
  }

  if (!slotId) {
    return (
      <aside className={`ad-slot ad-slot-empty ${compact ? "ad-slot-compact" : ""}`} aria-label={label}>
        <span>Auto Ads active: slot ID optional</span>
      </aside>
    );
  }

  return (
    <ins
      className="adsbygoogle ad-slot"
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
      aria-label={label}
    />
  );
}
