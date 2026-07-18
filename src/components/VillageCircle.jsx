import { useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  CalendarDays,
  Heart,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";

const storageKey = "kapoorpurVillageCircle";

const reactionTypes = [
  { id: "pranam", label: "प्रणाम" },
  { id: "yaad", label: "याद आया" },
  { id: "wah", label: "वाह" },
  { id: "madad", label: "मदद" },
];

const postTypes = [
  { id: "memory", label: "याद" },
  { id: "notice", label: "सूचना" },
  { id: "help", label: "मदद" },
  { id: "event", label: "कार्यक्रम" },
  { id: "blessing", label: "बधाई" },
];

const prompts = [
  "आज कपूरपुर की कौन सी पुरानी बात याद आई?",
  "गांव में किस जगह की फोटो अगली बार जोड़नी चाहिए?",
  "किस बुजुर्ग की कहानी बच्चों तक पहुंचनी चाहिए?",
  "किस परिवार या कार्यक्रम की याद गैलरी में रखनी चाहिए?",
];

function assetUrl(path) {
  if (!path) return "";
  if (/^https?:/i.test(path) || path.startsWith("data:")) return path;
  return `${import.meta.env.BASE_URL}${path}`.replace(/\/\.\//g, "/");
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
}

function saveState(nextState) {
  localStorage.setItem(storageKey, JSON.stringify(nextState));
}

function buildSeedPosts(items) {
  const seeds = items.slice(0, 5).map((item, index) => ({
    id: `memory-thread-${item.id}`,
    type: "memory",
    author: index % 2 === 0 ? "Kapoorpur Memory Team" : "गांव परिवार",
    title: item.titleHi,
    body: item.descriptionHi,
    image: item.image,
    meta: `${item.year} · ${item.location}`,
    pinned: index === 0,
  }));

  return [
    {
      id: "daily-prompt",
      type: "prompt",
      author: "आज की गांव बात",
      title: "कपूरपुर Circle",
      body: prompts[new Date().getDate() % prompts.length],
      meta: "Daily prompt",
      pinned: true,
    },
    {
      id: "village-help-board",
      type: "help",
      author: "सेवा सूचना",
      title: "मदद और सूचना बोर्ड",
      body: "खोई चीज, कार्यक्रम, सफाई, स्वास्थ्य शिविर, स्कूल सूचना या किसी परिवार की मदद यहां लिखें।",
      meta: "Community board",
      pinned: false,
    },
    ...seeds,
  ];
}

export default function VillageCircle({ items, memories, onOpenMemories }) {
  const [circleState, setCircleState] = useState(loadState);
  const [postText, setPostText] = useState("");
  const [postType, setPostType] = useState("memory");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [notice, setNotice] = useState("");

  const seedPosts = useMemo(() => buildSeedPosts(memories.length ? memories : items), [items, memories]);
  const customPosts = circleState.posts || [];
  const posts = useMemo(() => [...customPosts, ...seedPosts], [customPosts, seedPosts]);
  const saved = circleState.saved || {};
  const reactions = circleState.reactions || {};
  const comments = circleState.comments || {};
  const streak = circleState.streak || { count: 0, lastDate: "" };

  function updateCircle(nextPatch) {
    const nextState = { ...circleState, ...nextPatch };
    setCircleState(nextState);
    saveState(nextState);
  }

  function react(postId, reactionId) {
    const postReactions = reactions[postId] || {};
    updateCircle({
      reactions: {
        ...reactions,
        [postId]: {
          ...postReactions,
          [reactionId]: (postReactions[reactionId] || 0) + 1,
        },
      },
    });
  }

  function toggleSave(postId) {
    updateCircle({
      saved: {
        ...saved,
        [postId]: !saved[postId],
      },
    });
  }

  function addComment(postId) {
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;
    updateCircle({
      comments: {
        ...comments,
        [postId]: [
          { id: `${postId}-${Date.now()}`, author: "आप", text },
          ...(comments[postId] || []),
        ].slice(0, 8),
      },
    });
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
  }

  function createPost(event) {
    event.preventDefault();
    const body = postText.trim();
    if (!body) return;

    const today = new Date().toISOString().slice(0, 10);
    const nextStreak = {
      lastDate: today,
      count: streak.lastDate === today ? streak.count : streak.count + 1,
    };

    updateCircle({
      streak: nextStreak,
      posts: [
        {
          id: `local-post-${Date.now()}`,
          type: postType,
          author: "आप",
          title: postTypes.find((type) => type.id === postType)?.label || "गांव बात",
          body,
          meta: "अभी · आपके मोबाइल पर सुरक्षित",
          pinned: false,
        },
        ...customPosts,
      ].slice(0, 20),
    });
    setPostText("");
    setNotice("आपकी बात Circle में जुड़ गई। Firebase जोड़ने पर इसे गांव के सब लोग देख सकेंगे।");
  }

  async function sharePost(post) {
    const text = `${post.title}\n\n${post.body}\n\nVillage Gallery Kapoorpur`;
    const url = `${window.location.origin}${window.location.pathname}#circle`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text, url });
        setNotice("Share खुल गया।");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setNotice("Share text copy हो गया।");
        return;
      }
      setNotice("इस मोबाइल में share support नहीं है।");
    } catch {
      setNotice("Share cancel हो गया।");
    }
  }

  return (
    <section className="circle-page" aria-labelledby="circle-title">
      <div className="circle-hero">
        <div>
          <span className="eyebrow">Village Social Network</span>
          <h1 id="circle-title">कपूरपुर Circle</h1>
          <p>
            गांव की यादें, मदद, सूचना, बधाई और कार्यक्रम एक शांत, भरोसेमंद जगह पर। यहां बात गांव की रहेगी,
            algorithm की नहीं।
          </p>
          <div className="circle-actions">
            <button className="icon-button primary" type="button" onClick={onOpenMemories}>
              <Sparkles size={18} />
              Memory Book खोलें
            </button>
            <button className="icon-button" type="button" onClick={() => setNotice(prompts[new Date().getDate() % prompts.length])}>
              <Bell size={18} />
              आज की बात
            </button>
          </div>
        </div>
        <div className="circle-scoreboard" aria-label="Village Circle stats">
          <div>
            <UsersRound size={22} />
            <strong>{posts.length}</strong>
            <span>गांव बातें</span>
          </div>
          <div>
            <Bookmark size={22} />
            <strong>{Object.values(saved).filter(Boolean).length}</strong>
            <span>saved</span>
          </div>
          <div>
            <Trophy size={22} />
            <strong>{streak.count || 0}</strong>
            <span>day streak</span>
          </div>
        </div>
      </div>

      <div className="circle-layout">
        <aside className="circle-panel">
          <h2>आज कपूरपुर में</h2>
          <div className="prompt-card">
            <span>Daily prompt</span>
            <p>{prompts[new Date().getDate() % prompts.length]}</p>
          </div>
          <div className="circle-rules">
            <strong>क्यों बेहतर?</strong>
            <span>गांव की बातें, कम शोर</span>
            <span>यादें और परिवार केंद्र में</span>
            <span>मदद, सूचना और कार्यक्रम पहले</span>
            <span>Share बाहर भी, यादें अंदर भी</span>
          </div>
        </aside>

        <div className="circle-feed">
          <form className="circle-composer" onSubmit={createPost}>
            <div className="composer-types" role="tablist" aria-label="Post type">
              {postTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={postType === type.id ? "active" : ""}
                  onClick={() => setPostType(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <textarea
              value={postText}
              onChange={(event) => setPostText(event.target.value)}
              rows={3}
              placeholder="गांव की याद, सूचना, मदद या बधाई लिखें..."
            />
            <button className="icon-button primary" type="submit">
              <Send size={18} />
              Circle में जोड़ें
            </button>
            {notice ? <p className="circle-notice">{notice}</p> : null}
          </form>

          {posts.map((post) => {
            const postComments = comments[post.id] || [];
            const postReactions = reactions[post.id] || {};
            return (
              <article className={`circle-post ${post.pinned ? "pinned" : ""}`} key={post.id}>
                <div className="post-header">
                  <div>
                    <span>{post.author}</span>
                    <h3>{post.title}</h3>
                  </div>
                  <button
                    className={`save-button ${saved[post.id] ? "active" : ""}`}
                    type="button"
                    onClick={() => toggleSave(post.id)}
                    aria-label="Save post"
                  >
                    <Bookmark size={18} />
                  </button>
                </div>

                {post.image ? <img className="post-image" src={assetUrl(post.image)} alt={post.title} loading="lazy" /> : null}
                <p>{post.body}</p>
                <div className="post-meta">
                  <span>
                    <CalendarDays size={15} />
                    {post.meta}
                  </span>
                </div>

                <div className="reaction-row" aria-label="Post reactions">
                  {reactionTypes.map((reaction) => (
                    <button key={reaction.id} type="button" onClick={() => react(post.id, reaction.id)}>
                      <Heart size={15} />
                      {reaction.label}
                      <strong>{postReactions[reaction.id] || 0}</strong>
                    </button>
                  ))}
                  <button type="button" onClick={() => sharePost(post)}>
                    <Share2 size={15} />
                    Share
                  </button>
                </div>

                <div className="comment-box">
                  <MessageCircle size={18} />
                  <input
                    value={commentDrafts[post.id] || ""}
                    onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                    placeholder="छोटा जवाब लिखें..."
                  />
                  <button type="button" onClick={() => addComment(post.id)}>
                    भेजें
                  </button>
                </div>

                {postComments.length ? (
                  <div className="comment-list">
                    {postComments.map((comment) => (
                      <p key={comment.id}>
                        <strong>{comment.author}</strong>
                        {comment.text}
                      </p>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
