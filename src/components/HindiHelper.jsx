import { useMemo, useState } from "react";
import { Mic, Search, Volume2, WandSparkles } from "lucide-react";
import { faqItems } from "../data/content";

export default function HindiHelper({ galleryItems, onSearch, activeText }) {
  const [answer, setAnswer] = useState(faqItems[0].answer);
  const [listening, setListening] = useState(false);

  const suggestions = useMemo(() => {
    const words = galleryItems
      .flatMap((item) => [item.titleHi, item.location, item.person, item.year])
      .filter(Boolean);
    return [...new Set(words)].slice(0, 8);
  }, [galleryItems]);

  function speak(text = activeText || answer) {
    if (!("speechSynthesis" in window)) {
      setAnswer("इस मोबाइल में आवाज से पढ़ने की सुविधा उपलब्ध नहीं है।");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAnswer("इस ब्राउजर में Hindi voice search उपलब्ध नहीं है। खोज बॉक्स में हिंदी लिखकर खोजें।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      onSearch(text);
      setAnswer(`मैंने "${text}" खोज दिया है।`);
    };
    recognition.start();
  }

  return (
    <section className="helper-panel" aria-labelledby="helper-title">
      <div className="section-heading compact-heading">
        <span className="eyebrow">Free Hindi AI</span>
        <h2 id="helper-title">हिंदी सहायक</h2>
        <p>बिना paid API के voice search, जवाब, पढ़कर सुनाना और smart suggestions.</p>
      </div>

      <div className="helper-actions">
        <button className="icon-button primary" onClick={startVoiceSearch} type="button">
          <Mic size={18} />
          {listening ? "सुन रहा हूं..." : "बोलकर खोजें"}
        </button>
        <button className="icon-button" onClick={() => speak()} type="button">
          <Volume2 size={18} />
          पढ़कर सुनाएं
        </button>
      </div>

      <div className="faq-row" role="list" aria-label="Hindi help questions">
        {faqItems.map((item) => (
          <button key={item.question} type="button" onClick={() => setAnswer(item.answer)}>
            {item.question}
          </button>
        ))}
      </div>

      <div className="assistant-answer">
        <WandSparkles size={18} />
        <p>{answer}</p>
      </div>

      <div className="suggestions" aria-label="Smart search suggestions">
        <Search size={17} />
        {suggestions.map((term) => (
          <button key={term} type="button" onClick={() => onSearch(term)}>
            {term}
          </button>
        ))}
      </div>
    </section>
  );
}
