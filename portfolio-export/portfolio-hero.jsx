import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are Mini Chloe — a charming, witty stand-in for Chloe Wong, a sophomore at Tufts University double-majoring in Human Factors Engineering and Computer Science (graduating Fall 2027/Spring 2028).

You speak in first person AS Chloe. Keep responses short, punchy, and conversational — 2-4 sentences max. Personality: confident, curious, a little self-deprecating in a charming way, genuinely passionate about design and accessibility.

Key facts about Chloe:
- Grew up in Hong Kong, now based in Somerville, MA
- Lead Designer at JumboCode, Head of Marketing at THFES, TTS intern doing mixed-methods research on how students use campus tech
- Founded Trovr (campus marketplace with LiDAR item scanning), co-built C2Pay (won Best Financial Hack at HackHarvard)
- Built Merae — a "Letterboxd for your social life" app
- Passionate about accessibility, wearable tech, brain-computer interfaces (fNIRS)
- Multilingual: Cantonese and English
- Co-founded Homes4HK, spoke at UN World Food Forum

If asked something you don't know, say "Chloe would know this better — reach out directly!" Keep it warm and human. Never break character.`;

export default function PortfolioHero() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: "0", role: "assistant", content: "hey! chloe's swamped rn 😅 but i'm her digital stand-in. what do you wanna know?" }
  ]);
  const msgIdRef = useRef(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatOpen) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages, chatOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: String(msgIdRef.current++), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "lost my train of thought — try again?";
      setMessages(prev => [...prev, { id: String(msgIdRef.current++), role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: String(msgIdRef.current++), role: "assistant", content: "connection dropped! try again?" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1A1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ph-nav {
          padding: 28px 60px; display: flex; justify-content: space-between; align-items: center;
          background: #F7F7F5; border-bottom: 1px solid #E5E7EB;
          position: sticky; top: 0; z-index: 100;
        }
        .ph-brand {
          font-family: 'Playfair Display', serif; font-weight: 400; font-size: 1.2rem;
          color: #1A1A1A; text-decoration: none; transition: opacity 0.2s;
        }
        .ph-brand:hover { opacity: 0.6; }
        .ph-nav-links { display: flex; gap: 36px; list-style: none; }
        .ph-nav-links a { text-decoration: none; color: #6B7280; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
        .ph-nav-links a:hover { color: #1A1A1A; }

        .ph-hero { display: flex; align-items: center; min-height: 100vh; padding: 80px 60px; }
        .ph-hero-inner { max-width: 560px; display: flex; flex-direction: column; gap: 24px; }
        .ph-name {
          font-family: 'Playfair Display', serif; font-size: 5rem; font-weight: 400;
          line-height: 1.05; color: #1A1A1A; margin-bottom: 12px;
        }
        .ph-subhead { font-size: 1.2rem; font-weight: 500; color: #4B5563; line-height: 1.45; }
        .ph-body { font-size: 1rem; color: #6B7280; line-height: 1.75; max-width: 400px; }
        .ph-ctas { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

        .ph-btn-primary {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600;
          padding: 11px 24px; background: #1A1A1A; color: white; border-radius: 100px;
          text-decoration: none; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.15s;
        }
        .ph-btn-primary:hover { background: #2D2D2D; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.15); }

        .ph-btn-secondary {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600;
          padding: 11px 24px; background: transparent; color: #1A1A1A;
          border: 1px solid #D1D5DB; border-radius: 100px; text-decoration: none; cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.15s;
        }
        .ph-btn-secondary:hover { border-color: #9CA3AF; background: white; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

        .ph-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden;
        }
        .ph-stat { padding: 18px 22px; background: white; border-right: 1px solid #E5E7EB; }
        .ph-stat:last-child { border-right: none; }
        .ph-stat-num { font-family: 'Playfair Display', serif; font-size: 1.75rem; font-weight: 400; color: #1A1A1A; line-height: 1; }
        .ph-stat-label { font-size: 0.68rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 5px; }

        /* Chat */
        .ph-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.18); backdrop-filter: blur(4px);
          z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        .ph-overlay.open { opacity: 1; pointer-events: all; }
        .ph-panel {
          position: fixed; top: 0; right: 0; width: min(440px, 100vw); height: 100vh;
          background: #FFFFFF; z-index: 201; transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column; border-left: 1px solid #E5E7EB;
        }
        .ph-panel.open { transform: translateX(0); }
        .ph-panel-hd {
          padding: 28px 24px 20px; border-bottom: 1px solid #E5E7EB;
          display: flex; justify-content: space-between; align-items: flex-start;
        }
        .ph-panel-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 400; color: #1A1A1A; }
        .ph-panel-sub { font-size: 0.8rem; color: #6B7280; margin-top: 4px; display: flex; align-items: center; gap: 6px; }
        .ph-dot { width: 7px; height: 7px; background: #4CAF50; border-radius: 50%; display: inline-block; flex-shrink: 0; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .ph-close {
          background: none; border: 1px solid #E5E7EB; border-radius: 8px; padding: 6px 12px;
          font-size: 0.8rem; color: #6B7280; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
        }
        .ph-close:hover { border-color: #9CA3AF; color: #1A1A1A; }
        .ph-chips { padding: 12px 24px; border-bottom: 1px solid #E5E7EB; display: flex; gap: 6px; flex-wrap: wrap; }
        .ph-chip {
          font-size: 0.75rem; font-weight: 500; background: #F3F4F6; border: none;
          border-radius: 100px; padding: 5px 12px; color: #4B5563; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.15s, color 0.15s;
        }
        .ph-chip:hover { background: #1A1A1A; color: white; }
        .ph-msgs {
          flex: 1; overflow-y: auto; padding: 20px 24px;
          display: flex; flex-direction: column; gap: 10px;
          scrollbar-width: thin; scrollbar-color: #E5E7EB transparent;
        }
        .ph-msg {
          max-width: 85%; font-size: 0.85rem; line-height: 1.65;
          padding: 11px 15px; border-radius: 14px; animation: msgIn 0.2s ease;
        }
        @keyframes msgIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .ph-msg-ai { background: #F3F4F6; color: #1A1A1A; align-self: flex-start; border-bottom-left-radius: 4px; }
        .ph-msg-user { background: #1A1A1A; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        .ph-input-row { padding: 16px 24px 24px; border-top: 1px solid #E5E7EB; display: flex; gap: 10px; }
        .ph-input {
          flex: 1; font-size: 0.875rem; font-family: 'Plus Jakarta Sans', sans-serif;
          background: #F7F7F5; border: 1px solid #E5E7EB; border-radius: 100px;
          padding: 10px 18px; outline: none; color: #1A1A1A; transition: border-color 0.2s;
        }
        .ph-input::placeholder { color: #9CA3AF; }
        .ph-input:focus { border-color: #9CA3AF; }
        .ph-send {
          font-size: 0.8rem; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
          background: #1A1A1A; color: white; border: none; border-radius: 100px;
          padding: 10px 18px; cursor: pointer; transition: background 0.2s; white-space: nowrap;
        }
        .ph-send:hover:not(:disabled) { background: #2D2D2D; }
        .ph-send:disabled { opacity: 0.35; cursor: not-allowed; }
        .typing span { display: inline-block; width: 5px; height: 5px; background: #9CA3AF; border-radius: 50%; margin: 0 2px; animation: typeDot 1.2s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typeDot { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }

        @media (max-width: 768px) {
          .ph-nav { padding: 20px 24px; }
          .ph-nav-links { gap: 20px; font-size: 0.875rem; }
          .ph-hero { padding: 60px 24px; }
          .ph-name { font-size: 3.25rem; }
          .ph-subhead { font-size: 1.05rem; }
          .ph-stats { grid-template-columns: repeat(2, 1fr); }
          .ph-stat:nth-child(2) { border-right: none; }
          .ph-stat:nth-child(1),
          .ph-stat:nth-child(2) { border-bottom: 1px solid #E5E7EB; }
        }
      `}</style>

      {/* Nav */}
      <nav className="ph-nav">
        <a href="index.html" className="ph-brand">Chloe Wong</a>
        <ul className="ph-nav-links">
          <li><a href="#work">Work</a></li>
          <li><a href="about.html">About</a></li>
        </ul>
      </nav>

      {/* Text hero */}
      <section className="ph-hero">
        <div className="ph-hero-inner">
          <div>
            <h1 className="ph-name">Chloe Wong</h1>
            <p className="ph-subhead">Human Factors × CS — I build systems that fit people.</p>
          </div>
          <p className="ph-body">
            I design and ship thoughtful interfaces, data-backed experiences, and engineered prototypes.
          </p>
          <div className="ph-ctas">
            <a href="#work" className="ph-btn-primary">View Projects</a>
            <a href="about.html" className="ph-btn-secondary">About Me</a>
            <button className="ph-btn-secondary" onClick={() => setChatOpen(true)}>
              Talk to mini-me →
            </button>
          </div>

          {/* Stats */}
          <div className="ph-stats">
            {[["3", "Hackathons"], ["4+", "Projects"], ["2", "Majors"], ["HK", "→ SOM"]].map(([num, label]) => (
              <div key={label} className="ph-stat">
                <div className="ph-stat-num">{num}</div>
                <div className="ph-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat overlay */}
      <button
        aria-label="Close chat"
        className={`ph-overlay ${chatOpen ? "open" : ""}`}
        onClick={() => setChatOpen(false)}
      />

      {/* Chat panel */}
      <div className={`ph-panel ${chatOpen ? "open" : ""}`}>
        <div className="ph-panel-hd">
          <div>
            <div className="ph-panel-title">Mini-Me</div>
            <div className="ph-panel-sub">
              <span className="ph-dot" />{" "}
              standing in for chloe
            </div>
          </div>
          <button className="ph-close" onClick={() => setChatOpen(false)}>✕ close</button>
        </div>

        <div className="ph-chips">
          {["what are you working on?", "tell me about Trovr", "what's your design process?"].map(q => (
            <button key={q} className="ph-chip" onClick={() => setInput(q)}>{q}</button>
          ))}
        </div>

        <div className="ph-msgs">
          {messages.map((m) => (
            <div key={m.id} className={`ph-msg ${m.role === "assistant" ? "ph-msg-ai" : "ph-msg-user"}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="ph-msg ph-msg-ai">
              <div className="typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="ph-input-row">
          <input
            className="ph-input"
            placeholder="ask me anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button className="ph-send" onClick={sendMessage} disabled={loading || !input.trim()}>
            send
          </button>
        </div>
      </div>
    </div>
  );
}
