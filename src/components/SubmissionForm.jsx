import { useState } from "react";
import { Send, Upload } from "lucide-react";
import { createSubmission } from "../services/galleryService";
import { categories } from "../data/sampleGallery";

const initialForm = {
  titleHi: "",
  descriptionHi: "",
  category: "memory",
  year: "",
  person: "",
  location: "",
  contact: "",
};

export default function SubmissionForm() {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setStatus("");
    try {
      await createSubmission(form, file);
      setStatus("आपकी याद एडमिन मंजूरी के लिए भेज दी गई है।");
      setForm(initialForm);
      setFile(null);
      formElement.reset();
    } catch (error) {
      setStatus(error.message || "भेजने में समस्या आई।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="form-panel" aria-labelledby="submit-title">
      <div className="section-heading compact-heading">
        <span className="eyebrow">Public Submission</span>
        <h2 id="submit-title">अपनी याद भेजें</h2>
        <p>फोटो, परिवार की याद या गांव की कहानी भेजें। एडमिन मंजूरी के बाद प्रकाशित होगी।</p>
      </div>
      <form className="stacked-form" onSubmit={submit}>
        <label>
          हिंदी शीर्षक
          <input value={form.titleHi} onChange={(event) => update("titleHi", event.target.value)} required />
        </label>
        <label>
          कहानी या विवरण
          <textarea value={form.descriptionHi} onChange={(event) => update("descriptionHi", event.target.value)} rows={4} required />
        </label>
        <div className="form-grid">
          <label>
            श्रेणी
            <select value={form.category} onChange={(event) => update("category", event.target.value)}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.hi}
                </option>
              ))}
            </select>
          </label>
          <label>
            साल / तारीख
            <input value={form.year} onChange={(event) => update("year", event.target.value)} placeholder="जैसे 1998" />
          </label>
          <label>
            व्यक्ति / परिवार
            <input value={form.person} onChange={(event) => update("person", event.target.value)} />
          </label>
          <label>
            जगह
            <input value={form.location} onChange={(event) => update("location", event.target.value)} />
          </label>
        </div>
        <label>
          संपर्क जानकारी
          <input value={form.contact} onChange={(event) => update("contact", event.target.value)} placeholder="मोबाइल या Gmail" />
        </label>
        <label className="file-input">
          <Upload size={18} />
          फोटो या वीडियो चुनें
          <input type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        </label>
        <button className="icon-button primary" type="submit" disabled={busy}>
          <Send size={18} />
          {busy ? "भेज रहे हैं..." : "एडमिन को भेजें"}
        </button>
        {status ? <p className="form-status">{status}</p> : null}
      </form>
    </section>
  );
}
