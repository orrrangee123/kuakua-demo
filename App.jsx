import { useState, useRef, useCallback, useEffect } from "react";

/* ════════════════════════════════════════════
   MOCK DATA
   ════════════════════════════════════════════ */
const INIT_SELF = [
  { id: "s1", text: "做事很有条理，不管多忙都不会慌", source: "文字合成", date: "2024.08.15", duration: 6, images: [] },
  { id: "s2", text: "对朋友特别真诚，从来不敷衍", source: "录音", date: "2024.08.12", duration: 4, images: ["https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=200&h=200&fit=crop"] },
  { id: "s3", text: "学东西很快，理解力超强", source: "文字合成", date: "2024.08.10", duration: 5, images: [] },
  { id: "s4", text: "笑起来特别好看，让人心情也变好", source: "录音", date: "2024.08.08", duration: 3, images: [] },
];
const INIT_FRIEND = [
  { id: "f1", text: "你是我见过最温柔的人", from: "阿晴", source: "录音", date: "2024.08.14", duration: 4, images: [] },
  { id: "f2", text: "和你在一起总觉得很安心", from: "小鱼", source: "合成音", date: "2024.08.11", duration: 5, images: ["https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=200&h=200&fit=crop"] },
  { id: "f3", text: "你总是能看到别人看不到的美好", from: "妈妈", source: "录音", date: "2024.08.09", duration: 6, images: [] },
  { id: "f4", text: "遇到困难你从来不抱怨，特别坚强", from: "大头", source: "合成音", date: "2024.08.06", duration: 5, images: [] },
];
const DAILY_REVIEWS = [
  { date: "今天", text: "做事很有条理，不管多忙都不会慌", from: "自己", type: "self" },
  { date: "昨天", text: "你是我见过最温柔的人", from: "阿晴", type: "friend" },
  { date: "08.13", text: "学东西很快，理解力超强", from: "自己", type: "self" },
  { date: "08.12", text: "和你在一起总觉得很安心", from: "小鱼", type: "friend" },
];
const VOICES = [
  { id: "v1", name: "温柔姐姐", desc: "温柔平稳", free: true, emoji: "🌸" },
  { id: "v2", name: "元气少女", desc: "活泼上扬", free: true, emoji: "✨" },
  { id: "v3", name: "低沉治愈", desc: "低沉稳重", free: false, price: 6, emoji: "🌙" },
  { id: "v4", name: "甜美可爱", desc: "年轻活泼", free: false, price: 6, emoji: "🍬" },
];

/* ════════════════════════════════════════════
   DESIGN TOKENS
   ════════════════════════════════════════════ */
const T = {
  green: "#6ABF8A",
  greenSoft: "#6ABF8A16",
  purple: "#A98AD4",
  purpleSoft: "#A98AD416",
  gold: "#D4A855",
  goldSoft: "#D4A85516",
  bg: "#FAF8F4",
  card: "#FFFFFF",
  text1: "#3E3830",
  text2: "#7A7064",
  text3: "#B0A898",
  border: "#EDE9E2",
  danger: "#E07070",
  radius: 18,
  font: "'Outfit', 'Noto Sans SC', 'PingFang SC', system-ui, sans-serif",
  display: "'Lilita One', 'Outfit', sans-serif",
};

/* ════════════════════════════════════════════
   PRIMITIVES
   ════════════════════════════════════════════ */
const Pill = ({ active, color, children, onClick }) => (
  <button onClick={onClick} style={{
    padding: "9px 0", flex: 1, borderRadius: 12, border: "none", cursor: "pointer",
    fontSize: 13.5, fontWeight: 600, letterSpacing: 0.3,
    background: active ? "#fff" : "transparent",
    color: active ? color : T.text3,
    boxShadow: active ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
    transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
  }}>{children}</button>
);

const IconBtn = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", cursor: "pointer", padding: 0,
    display: "flex", alignItems: "center", justifyContent: "center", ...style,
  }}>{children}</button>
);

function PlayBtn({ playing, onClick, color = T.green, size = 38 }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: "50%", border: "none", cursor: "pointer",
      background: `linear-gradient(135deg, ${color}, ${color}CC)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 3px 14px ${color}40`, transition: "all 0.2s", flexShrink: 0,
    }}>
      {playing ? (
        <svg width={14} height={14} viewBox="0 0 16 16" fill="#fff"><rect x="2" y="1" width="4.5" height="14" rx="1.2"/><rect x="9.5" y="1" width="4.5" height="14" rx="1.2"/></svg>
      ) : (
        <svg width={13} height={14} viewBox="0 0 13 14" fill="#fff"><path d="M1 1.5a1 1 0 0 1 1.5-.87l9 5.2a1 1 0 0 1 0 1.74l-9 5.2A1 1 0 0 1 1 11.9V1.5z"/></svg>
      )}
    </button>
  );
}

function WaveBars({ active, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 22 }}>
      {[0, 80, 160, 240, 120, 200, 40].map((d, i) => (
        <div key={i} style={{
          width: 2.5, borderRadius: 2, background: color,
          height: active ? undefined : 5, transition: "height 0.3s",
          animation: active ? `kk-wave 0.7s ${d}ms ease-in-out infinite alternate` : "none",
        }} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   IMAGE UPLOAD HOOK
   ════════════════════════════════════════════ */
function useImageUpload(initial = []) {
  const [images, setImages] = useState(initial);
  const ref = useRef(null);
  const add = useCallback(() => ref.current?.click(), []);
  const onFile = useCallback((e) => {
    Array.from(e.target.files || []).forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => setImages((p) => [...p, ev.target.result]);
      r.readAsDataURL(f);
    });
    e.target.value = "";
  }, []);
  const remove = useCallback((i) => setImages((p) => p.filter((_, idx) => idx !== i)), []);
  return { images, setImages, add, remove, onFile, ref };
}

/* ════════════════════════════════════════════
   IMAGE ROW + LIGHTBOX
   ════════════════════════════════════════════ */
function ImageRow({ images, onAdd, onRemove, inputRef, onFile, compact }) {
  const sz = compact ? 52 : 64;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onFile} />
      {images.map((src, i) => (
        <div key={i} style={{ position: "relative", width: sz, height: sz, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {onRemove && (
            <button onClick={(e) => { e.stopPropagation(); onRemove(i); }} style={{
              position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%",
              background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11, lineHeight: 1, padding: 0,
            }}>×</button>
          )}
        </div>
      ))}
      {onAdd && (
        <button onClick={onAdd} style={{
          width: sz, height: sz, borderRadius: 10, border: `2px dashed ${T.border}`,
          background: "transparent", cursor: "pointer", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: T.text3, fontSize: 10, gap: 2, flexShrink: 0, transition: "all 0.2s",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          截图
        </button>
      )}
    </div>
  );
}

function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "kk-fadeIn 0.2s ease",
    }}>
      <img src={src} alt="" style={{ maxWidth: "92%", maxHeight: "85vh", borderRadius: 14, boxShadow: "0 8px 48px rgba(0,0,0,0.6)" }} />
      <button onClick={onClose} style={{
        position: "absolute", top: 18, right: 18, width: 36, height: 36,
        borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none",
        color: "#fff", fontSize: 20, cursor: "pointer", backdropFilter: "blur(4px)",
      }}>×</button>
    </div>
  );
}

/* ════════════════════════════════════════════
   TAB BAR
   ════════════════════════════════════════════ */
function TabBar({ active, onChange }) {
  const tabs = [
    { id: "home", icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?T.green:T.text3} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>, label: "主页" },
    { id: "collect", icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?T.green:T.text3} strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>, label: "收集" },
    { id: "toy", icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?T.green:T.text3} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>, label: "玩具" },
    { id: "me", icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?T.green:T.text3} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: "我的" },
  ];
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", padding: "6px 0 14px",
      borderTop: `1px solid ${T.border}`, background: T.bg, flexShrink: 0,
    }}>
      {tabs.map((t) => {
        const a = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            transition: "all 0.2s", opacity: a ? 1 : 0.5,
          }}>
            {t.icon(a)}
            <span style={{ fontSize: 10.5, fontWeight: a ? 700 : 500, color: a ? T.green : T.text3 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════
   HOME — 优点库
   ════════════════════════════════════════════ */
function HomePage({ selfItems, friendItems, onUpdateItems }) {
  const [zone, setZone] = useState("self");
  const [playing, setPlaying] = useState(null);
  const [subPage, setSubPage] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const items = zone === "self" ? selfItems : friendItems;
  const color = zone === "self" ? T.green : T.purple;
  const total = selfItems.length + friendItems.length;

  const handleAddImage = (itemId, file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const updater = (arr) => arr.map((it) =>
        it.id === itemId ? { ...it, images: [...it.images, ev.target.result] } : it
      );
      if (zone === "self") onUpdateItems("self", updater);
      else onUpdateItems("friend", updater);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (itemId, imgIdx) => {
    const updater = (arr) => arr.map((it) =>
      it.id === itemId ? { ...it, images: it.images.filter((_, i) => i !== imgIdx) } : it
    );
    if (zone === "self") onUpdateItems("self", updater);
    else onUpdateItems("friend", updater);
  };

  if (subPage === "review") return <DailyReview onBack={() => setSubPage(null)} />;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />

      {/* Header */}
      <div style={{ textAlign: "center", padding: "28px 0 6px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: T.text1, margin: 0, fontFamily: T.display, letterSpacing: 1.5 }}>
          KuaKua
        </h1>
        <p style={{ color: T.text3, fontSize: 13, margin: "8px 0 0", letterSpacing: 0.3 }}>
          你已收集 <span style={{ color, fontWeight: 800, fontSize: 20, fontFamily: T.display }}>{total}</span> 条优点
        </p>
      </div>

      {/* Daily review banner */}
      <button onClick={() => setSubPage("review")} style={{
        width: "100%", padding: "14px 18px", borderRadius: T.radius,
        background: "linear-gradient(135deg, #FFF7EC, #FFEDCF)", border: "none",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 18,
        textAlign: "left", transition: "transform 0.15s", boxSizing: "border-box",
      }}>
        <span style={{ fontSize: 28 }}>☀️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#8B7040" }}>每日回顾</div>
          <div style={{ fontSize: 12, color: "#BEA370", marginTop: 2 }}>今天也来听一条温暖的话吧</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9AD72" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        {[
          { label: "自己", count: selfItems.length, c: T.green, bg: T.greenSoft },
          { label: "朋友 / 家人", count: friendItems.length, c: T.purple, bg: T.purpleSoft },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "14px 0", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: s.c, fontWeight: 600, letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.c, fontFamily: T.display, marginTop: 2 }}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Zone tabs */}
      <div style={{ display: "flex", background: "#F0ECE6", borderRadius: 14, padding: 3, marginBottom: 10 }}>
        <Pill active={zone === "self"} color={T.green} onClick={() => { setZone("self"); setPlaying(null); }}>自己</Pill>
        <Pill active={zone === "friend"} color={T.purple} onClick={() => { setZone("friend"); setPlaying(null); }}>朋友 / 家人</Pill>
      </div>

      {/* Shuffle */}
      <button onClick={() => { const r = items[Math.floor(Math.random() * items.length)]; r && setPlaying(r.id); }} style={{
        display: "inline-flex", alignItems: "center", gap: 6, background: color + "12",
        border: "none", borderRadius: 20, padding: "7px 16px", cursor: "pointer",
        marginBottom: 14, fontSize: 13, color, fontWeight: 600,
      }}>🎲 随机播一条</button>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => {
          const isP = playing === item.id;
          return (
            <div key={item.id} style={{
              background: T.card, borderRadius: T.radius, padding: "16px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              border: isP ? `2px solid ${color}44` : "2px solid transparent",
              transition: "all 0.2s",
            }}>
              {/* Row 1: play + text + wave */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <PlayBtn playing={isP} onClick={() => setPlaying(isP ? null : item.id)} color={color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: T.text1, fontWeight: 500, lineHeight: 1.55, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.text}
                  </div>
                  <div style={{ fontSize: 12, color: T.text3, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                    <span>{item.date}</span>
                    <span style={{ opacity: 0.35 }}>·</span>
                    <span>{item.from ? `${item.from} · ` : ""}{item.source}</span>
                  </div>
                </div>
                <WaveBars active={isP} color={color} />
              </div>

              {/* Row 2: screenshots */}
              {item.images.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {item.images.map((src, i) => (
                    <div key={i} style={{ position: "relative", width: 56, height: 56, borderRadius: 10, overflow: "hidden", cursor: "pointer", flexShrink: 0, border: `1px solid ${T.border}` }}>
                      <img src={src} alt="" onClick={() => setLightbox(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveImage(item.id, i); }} style={{
                        position: "absolute", top: 1, right: 1, width: 16, height: 16, borderRadius: "50%",
                        background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer",
                        color: "#fff", fontSize: 10, lineHeight: 1, padding: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Row 3: add screenshot */}
              <div style={{ marginTop: 10 }}>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: T.text3, cursor: "pointer",
                  padding: "5px 12px 5px 8px", borderRadius: 8,
                  background: "#F7F5F1", transition: "background 0.15s",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  添加截图
                  <input type="file" accept="image/*" multiple style={{ display: "none" }}
                    onChange={(e) => { Array.from(e.target.files || []).forEach((f) => handleAddImage(item.id, f)); e.target.value = ""; }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: T.text3, fontSize: 14, lineHeight: 1.8 }}>
          这里还空着<br />去收集你的第一条优点吧 ✨
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   DAILY REVIEW
   ════════════════════════════════════════════ */
function DailyReview({ onBack }) {
  const [playing, setPlaying] = useState(null);
  const today = DAILY_REVIEWS[0];
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
      <IconBtn onClick={onBack} style={{ padding: "18px 0", color: T.text3, gap: 4 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        返回
      </IconBtn>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text1, margin: "0 0 18px", fontFamily: T.display }}>每日回顾</h2>
      <div style={{
        background: "linear-gradient(150deg, #FFF9EF, #FFEED6)", borderRadius: 22,
        padding: "30px 24px", marginBottom: 28, textAlign: "center",
        boxShadow: "0 4px 24px rgba(212,168,85,0.12)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>TODAY</div>
        <div style={{ fontSize: 20, color: "#5A4D3E", fontWeight: 600, lineHeight: 1.65, marginBottom: 18 }}>
          「{today.text}」
        </div>
        <div style={{ fontSize: 13, color: "#BEA370", marginBottom: 20 }}>
          {today.type === "friend" ? `来自朋友 ${today.from}` : "来自自己"} · {today.date}
        </div>
        <PlayBtn playing={playing === "today"} onClick={() => setPlaying(playing === "today" ? null : "today")} color={T.gold} size={50} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text2, marginBottom: 14, letterSpacing: 0.5 }}>历史回顾</div>
      {DAILY_REVIEWS.slice(1).map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.type === "self" ? T.green : T.purple, flexShrink: 0 }} />
            {i < DAILY_REVIEWS.length - 2 && <div style={{ width: 2, flex: 1, background: T.border, marginTop: 4 }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 5, fontWeight: 600 }}>{item.date}</div>
            <div onClick={() => setPlaying(playing === `h${i}` ? null : `h${i}`)} style={{
              fontSize: 14, color: T.text1, background: T.card, borderRadius: 14,
              padding: "12px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", cursor: "pointer",
              border: playing === `h${i}` ? `2px solid ${(item.type === "self" ? T.green : T.purple) + "33"}` : "2px solid transparent",
            }}>
              {item.text}
              <div style={{ fontSize: 12, color: T.text3, marginTop: 5 }}>
                {item.type === "friend" ? `来自 ${item.from}` : "来自自己"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   COLLECT PAGE
   ════════════════════════════════════════════ */
function CollectPage({ onAddItem }) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("v1");
  const [belong, setBelong] = useState("self");
  const [mode, setMode] = useState("text");
  const [isRec, setIsRec] = useState(false);
  const [saved, setSaved] = useState(false);
  const imgUp = useImageUpload();
  const color = belong === "self" ? T.green : T.purple;

  const handleSave = () => {
    if (!text.trim() && mode === "text") return;
    onAddItem(belong, {
      id: "n" + Date.now(), text: mode === "text" ? text : "（录音内容）",
      source: mode === "text" ? "文字合成" : "录音", date: "今天", duration: 5,
      images: [...imgUp.images],
    });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setText(""); imgUp.setImages([]);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
      <div style={{ textAlign: "center", padding: "28px 0 18px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text1, margin: 0, fontFamily: T.display }}>收集优点</h2>
      </div>

      {/* Invite */}
      <div style={{ background: "linear-gradient(135deg, #F1EAFF, #E8DFFF)", borderRadius: T.radius, padding: "20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #D4C4F7, #B59ADE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🌟</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#5A4A6B" }}>邀请朋友 / 家人</div>
            <div style={{ fontSize: 12, color: "#9585AC", marginTop: 2 }}>让他们也来夸夸你吧</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: T.purple, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>分享给朋友</button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: `2px solid ${T.purple}`, background: "transparent", color: T.purple, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>复制链接</button>
        </div>
      </div>

      {/* Mode */}
      <div style={{ display: "flex", background: "#F0ECE6", borderRadius: 14, padding: 3, marginBottom: 18 }}>
        <Pill active={mode === "text"} color={T.text1} onClick={() => setMode("text")}>✍️ 文字录入</Pill>
        <Pill active={mode === "record"} color={T.text1} onClick={() => setMode("record")}>🎤 直接录音</Pill>
      </div>

      {mode === "text" ? (
        <>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="写下你发现的优点吧，比如「我今天很有耐心」..."
            style={{ width: "100%", minHeight: 96, borderRadius: 16, border: `2px solid ${T.border}`, padding: "14px 16px", fontSize: 15, color: T.text1, background: "#FDFCF9", resize: "vertical", fontFamily: T.font, outline: "none", boxSizing: "border-box", lineHeight: 1.6, transition: "border-color 0.2s" }}
            onFocus={(e) => e.target.style.borderColor = color}
            onBlur={(e) => e.target.style.borderColor = T.border}
          />
          {/* Screenshots */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 8, fontWeight: 600 }}>附带截图（可选）</div>
            <ImageRow images={imgUp.images} onAdd={imgUp.add} onRemove={imgUp.remove} inputRef={imgUp.ref} onFile={imgUp.onFile} />
          </div>
          {/* Voice */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 8, fontWeight: 600 }}>选择音色</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {VOICES.map((v) => (
                <button key={v.id} onClick={() => setVoice(v.id)} style={{
                  padding: "11px 14px", borderRadius: 14, textAlign: "left",
                  border: voice === v.id ? `2px solid ${T.green}` : `2px solid ${T.border}`,
                  background: voice === v.id ? T.greenSoft : T.card, cursor: "pointer", transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text1 }}>{v.emoji} {v.name}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>{v.desc} {!v.free && <span style={{ color: T.gold, fontWeight: 700 }}>¥{v.price}</span>}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Belong */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 8, fontWeight: 600 }}>归属区域</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ id: "self", label: "自己", c: T.green }, { id: "friend", label: "朋友 / 家人", c: T.purple }].map((b) => (
                <button key={b.id} onClick={() => setBelong(b.id)} style={{
                  flex: 1, padding: "11px", borderRadius: 12, border: "none",
                  background: belong === b.id ? b.c + "18" : "#F0ECE6",
                  color: belong === b.id ? b.c : T.text3,
                  fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
                }}>{b.label}</button>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button style={{ flex: 1, padding: "14px", borderRadius: 14, border: `2px solid ${T.border}`, background: T.card, color: T.text2, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>试听</button>
            <button onClick={handleSave} style={{
              flex: 2, padding: "14px", borderRadius: 14, border: "none",
              background: text.trim() ? color : "#DDD8D0", color: text.trim() ? "#fff" : T.text3,
              fontWeight: 700, fontSize: 15, cursor: text.trim() ? "pointer" : "default", transition: "all 0.25s",
            }}>保存</button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 14, color: T.text3, marginBottom: 26 }}>{isRec ? "正在录音，松手结束..." : "长按按钮开始录音"}</div>
          <button onMouseDown={() => setIsRec(true)} onMouseUp={() => setIsRec(false)} onTouchStart={() => setIsRec(true)} onTouchEnd={() => setIsRec(false)} style={{
            width: 96, height: 96, borderRadius: "50%", border: "none",
            background: isRec ? "radial-gradient(circle, #FF9090, #E06060)" : `radial-gradient(circle, ${T.green}, #4DA070)`,
            cursor: "pointer", fontSize: 36,
            boxShadow: isRec ? "0 0 0 18px #E0606018, 0 4px 24px #E0606044" : `0 0 0 14px ${T.greenSoft}, 0 4px 24px ${T.green}33`,
            transition: "all 0.3s", animation: isRec ? "kk-pulse 1s ease-in-out infinite" : "none",
          }}>🎤</button>
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 8, fontWeight: 600 }}>附带截图（可选）</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ImageRow images={imgUp.images} onAdd={imgUp.add} onRemove={imgUp.remove} inputRef={imgUp.ref} onFile={imgUp.onFile} />
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 8 }}>归属区域</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {[{ id: "self", label: "自己", c: T.green }, { id: "friend", label: "朋友 / 家人", c: T.purple }].map((b) => (
                <button key={b.id} onClick={() => setBelong(b.id)} style={{
                  padding: "10px 28px", borderRadius: 12, border: "none",
                  background: belong === b.id ? b.c + "18" : "#F0ECE6",
                  color: belong === b.id ? b.c : T.text3,
                  fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
                }}>{b.label}</button>
              ))}
            </div>
          </div>
          <button onClick={handleSave} style={{
            marginTop: 20, padding: "14px 48px", borderRadius: 14, border: "none",
            background: color, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>保存录音</button>
        </div>
      )}

      {saved && (
        <div style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          background: "rgba(62,56,48,0.92)", color: "#fff", padding: "16px 30px",
          borderRadius: 16, fontSize: 15, fontWeight: 600, zIndex: 200,
          animation: "kk-fadeIn 0.25s ease", backdropFilter: "blur(8px)",
        }}>✨ 已保存到优点库</div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TOY PAGE
   ════════════════════════════════════════════ */
function ToyPage() {
  const [bound, setBound] = useState(false);
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
      <div style={{ textAlign: "center", padding: "28px 0 18px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text1, margin: 0, fontFamily: T.display }}>我的玩具</h2>
      </div>
      {!bound ? (
        <div style={{ textAlign: "center", padding: "36px 20px" }}>
          <div style={{ fontSize: 72, marginBottom: 20, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}>🧸</div>
          <h3 style={{ fontSize: 18, color: T.text1, fontWeight: 700, marginBottom: 6 }}>还没有绑定玩具</h3>
          <p style={{ fontSize: 14, color: T.text3, lineHeight: 1.7, maxWidth: 240, margin: "0 auto 28px" }}>绑定夸夸人玩具后，捏一下爪子就能听到鼓励哦</p>
          <button onClick={() => setBound(true)} style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${T.green}, #4DA070)`, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", marginBottom: 12, boxShadow: `0 4px 18px ${T.green}40` }}>📷 扫码绑定玩具</button>
          <button style={{ width: "100%", padding: "14px", borderRadius: 16, border: `2px solid ${T.border}`, background: "transparent", color: T.text3, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>没有玩具，先用小程序</button>
        </div>
      ) : (
        <>
          <div style={{ background: "linear-gradient(140deg, #E6F5EC, #D0EDDA)", borderRadius: 20, padding: "20px", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 38 }}>🧸</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#3D6B4F" }}>毛绒夸夸熊</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", boxShadow: "0 0 6px #4CAF5066" }} />
                  <span style={{ fontSize: 12, color: "#5A8B6A" }}>在线 · Wi-Fi 已连接</span>
                </div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#7A9B85" }}>同步状态</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#3D6B4F", marginTop: 3 }}>3 条待同步</div>
                <div style={{ fontSize: 11, color: "#9BB5A5", marginTop: 2 }}>上次同步: 2 小时前</div>
              </div>
              <button style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "#4CAF50", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>立即同步</button>
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text2, marginBottom: 10 }}>音效包</div>
          {[{ name: "默认音效", desc: "柔和提示音", active: true, free: true }, { name: "森林自然", desc: "鸟鸣和流水声", free: true }, { name: "星空梦境", desc: "空灵音乐盒", free: false, price: 12 }].map((p, i) => (
            <div key={i} style={{ background: T.card, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", border: p.active ? `2px solid ${T.green}33` : "2px solid transparent", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text1 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{p.desc}</div>
              </div>
              {p.active ? <span style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>使用中</span> : p.free ? <button style={{ padding: "6px 16px", borderRadius: 8, border: `2px solid ${T.green}`, background: "transparent", color: T.green, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>下载</button> : <button style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: T.gold, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>¥{p.price}</button>}
            </div>
          ))}
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text2, marginTop: 18, marginBottom: 10 }}>设备设置</div>
          {[{ label: "自动同步", desc: "开机自动拉取新内容", toggle: true }, { label: "修改 Wi-Fi", desc: "重新配置玩具网络" }, { label: "解绑玩具", desc: "解绑后可重新绑定", danger: true }].map((s, i) => (
            <div key={i} style={{ background: T.card, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: s.danger ? T.danger : T.text1 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{s.desc}</div>
              </div>
              {s.toggle ? <div style={{ width: 44, height: 24, borderRadius: 12, background: T.green, position: "relative", cursor: "pointer" }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, right: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} /></div> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   ME PAGE
   ════════════════════════════════════════════ */
function MePage() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
      <div style={{ textAlign: "center", padding: "28px 0 18px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text1, margin: 0, fontFamily: T.display }}>我的</h2>
      </div>
      <div style={{ background: "linear-gradient(150deg, #FFF8EE, #FFEED6)", borderRadius: 22, padding: "28px", marginBottom: 22, textAlign: "center", boxShadow: "0 4px 20px rgba(212,168,85,0.10)" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg, #FFDCA8, #FFB347)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🌻</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#5A4D3E" }}>小太阳</div>
        <div style={{ fontSize: 13, color: "#BEA370", marginTop: 5 }}>已收集 8 条优点 · 加入 15 天</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text2, marginBottom: 10 }}>设置</div>
      {[{ icon: "📝", label: "昵称", value: "小太阳" }, { icon: "🖼️", label: "头像", value: "点击修改" }, { icon: "⏰", label: "每日推送时间", value: "21:00" }, { icon: "🔔", label: "通知开关", toggle: true }].map((item, i) => (
        <div key={i} style={{ background: T.card, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
          <span style={{ fontSize: 18, marginRight: 12, width: 28, textAlign: "center" }}>{item.icon}</span>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.text1 }}>{item.label}</div>
          {item.toggle ? <div style={{ width: 44, height: 24, borderRadius: 12, background: T.green, position: "relative", cursor: "pointer" }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, right: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} /></div> : <span style={{ fontSize: 13, color: T.text3 }}>{item.value} ›</span>}
        </div>
      ))}
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text2, marginTop: 18, marginBottom: 10 }}>关于</div>
      {[{ icon: "🔒", label: "隐私说明" }, { icon: "📋", label: "用户协议" }, { icon: "💬", label: "意见反馈" }].map((item, i) => (
        <div key={i} style={{ background: T.card, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.03)", cursor: "pointer" }}>
          <span style={{ fontSize: 18, marginRight: 12, width: 28, textAlign: "center" }}>{item.icon}</span>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.text1 }}>{item.label}</div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   H5 FRIEND PAGE
   ════════════════════════════════════════════ */
function FriendH5({ onBack }) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [isRec, setIsRec] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 68, marginBottom: 20 }}>💌</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text1, margin: "0 0 8px", fontFamily: T.display }}>发送成功</h2>
      <p style={{ fontSize: 15, color: T.text3, lineHeight: 1.7, maxWidth: 260 }}>你的话已经发送给小太阳，TA 会很开心的 ✨</p>
      <button onClick={onBack} style={{ marginTop: 28, padding: "12px 36px", borderRadius: 14, border: "none", background: T.purple, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>返回 Demo</button>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
      <IconBtn onClick={onBack} style={{ padding: "18px 0", color: T.text3, gap: 4 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        返回
      </IconBtn>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #FFDCA8, #FFB347)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🌻</div>
        <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
          <strong style={{ color: T.text1 }}>小太阳</strong> 想收集朋友和家人眼中自己的优点，只需1分钟
        </p>
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="你的名字 / 昵称"
        style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `2px solid ${T.border}`, fontSize: 15, color: T.text1, background: "#FDFCF9", outline: "none", boxSizing: "border-box", marginBottom: 14, fontFamily: T.font }}
      />
      <div style={{ display: "flex", background: "#F0ECE6", borderRadius: 14, padding: 3, marginBottom: 18 }}>
        <Pill active={mode === "record"} color={T.text1} onClick={() => setMode("record")}>🎤 录音</Pill>
        <Pill active={mode === "text"} color={T.text1} onClick={() => setMode("text")}>✍️ 文字</Pill>
      </div>
      {mode === "record" ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 14, color: T.text3, marginBottom: 22 }}>{isRec ? "正在录音..." : "长按按钮开始录音"}</div>
          <button onMouseDown={() => setIsRec(true)} onMouseUp={() => setIsRec(false)} onTouchStart={() => setIsRec(true)} onTouchEnd={() => setIsRec(false)} style={{
            width: 84, height: 84, borderRadius: "50%", border: "none",
            background: isRec ? "radial-gradient(circle, #FF9090, #E06060)" : `radial-gradient(circle, ${T.purple}, #8670B8)`,
            cursor: "pointer", fontSize: 30,
            boxShadow: isRec ? "0 0 0 14px #E0606018" : `0 0 0 10px ${T.purpleSoft}`,
            transition: "all 0.3s",
          }}>🎤</button>
        </div>
      ) : (
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="写下你眼中 TA 的优点吧..."
          style={{ width: "100%", minHeight: 110, borderRadius: 16, border: `2px solid ${T.border}`, padding: "14px 16px", fontSize: 15, color: T.text1, background: "#FDFCF9", resize: "vertical", fontFamily: T.font, outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
        />
      )}
      <button onClick={() => name.trim() && setDone(true)} style={{
        width: "100%", padding: "16px", borderRadius: 16, border: "none",
        background: name.trim() ? `linear-gradient(135deg, ${T.purple}, #8670B8)` : "#DDD8D0",
        color: name.trim() ? "#fff" : T.text3,
        fontWeight: 700, fontSize: 16, cursor: name.trim() ? "pointer" : "default",
        marginTop: 22, transition: "all 0.3s", boxShadow: name.trim() ? `0 4px 18px ${T.purple}40` : "none",
      }}>发送给 TA 💌</button>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState("home");
  const [showH5, setShowH5] = useState(false);
  const [selfItems, setSelfItems] = useState(INIT_SELF);
  const [friendItems, setFriendItems] = useState(INIT_FRIEND);

  const handleUpdateItems = useCallback((zone, updater) => {
    if (zone === "self") setSelfItems(updater);
    else setFriendItems(updater);
  }, []);

  const handleAddItem = useCallback((zone, item) => {
    if (zone === "self") setSelfItems((p) => [item, ...p]);
    else setFriendItems((p) => [item, ...p]);
  }, []);

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", height: "100vh",
      display: "flex", flexDirection: "column",
      background: T.bg, fontFamily: T.font, position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Outfit:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap');
        @keyframes kk-wave { 0%{height:5px} 100%{height:18px} }
        @keyframes kk-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes kk-fadeIn { from{opacity:0;transform:translate(-50%,-50%) scale(0.92)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        *{-webkit-tap-highlight-color:transparent; box-sizing:border-box;}
        ::-webkit-scrollbar{width:0;height:0;}
        input,textarea{font-family:${T.font};}
        input::placeholder,textarea::placeholder{color:${T.text3};}
      `}</style>

      {/* H5 toggle */}
      <button onClick={() => setShowH5(!showH5)} style={{
        position: "absolute", top: 10, right: 14, zIndex: 50,
        background: showH5 ? T.purple : "rgba(255,255,255,0.88)",
        color: showH5 ? "#fff" : T.text3,
        border: showH5 ? "none" : `1.5px solid ${T.border}`,
        borderRadius: 10, padding: "6px 14px", fontSize: 11.5,
        fontWeight: 700, cursor: "pointer", backdropFilter: "blur(10px)", letterSpacing: 0.3,
      }}>
        {showH5 ? "← 小程序" : "H5 填写页 →"}
      </button>

      {showH5 ? <FriendH5 onBack={() => setShowH5(false)} /> : (
        <>
          {tab === "home" && <HomePage selfItems={selfItems} friendItems={friendItems} onUpdateItems={handleUpdateItems} />}
          {tab === "collect" && <CollectPage onAddItem={handleAddItem} />}
          {tab === "toy" && <ToyPage />}
          {tab === "me" && <MePage />}
          <TabBar active={tab} onChange={setTab} />
        </>
      )}
    </div>
  );
}
