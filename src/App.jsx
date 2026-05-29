import { useState, useEffect, useRef } from "react";

const ACCENT = "#00FF85";
const BG = "#080808";
const SURFACE = "#111111";
const SURFACE2 = "#161616";
const BORDER = "#1e1e1e";
const MUTED = "#555";
const TEXT = "#e8e8e8";

const API = "https://api.clippr.org"; // VPS backend — update if port changes

const FORMATS = [
  { id: "9:16", label: "9:16", sub: "TikTok / Reels", icon: "▌" },
  { id: "16:9", label: "16:9", sub: "YouTube", icon: "▬" },
  { id: "1:1", label: "1:1", sub: "Square", icon: "■" },
];

function ScoreRing({ score }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 90 ? "#00FF85" : score >= 70 ? "#FFD600" : "#FF6B35";
  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke="#1e1e1e" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <span style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: 11, fontWeight: 700, color, fontFamily: "'Space Mono', monospace"
      }}>{score}</span>
    </div>
  );
}

function Pill({ label, color }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
      color, fontFamily: "'Space Mono', monospace",
      background: `${color}15`, padding: "2px 6px", borderRadius: 3,
    }}>{label}</span>
  );
}

function DetectionLog({ entries }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);
  return (
    <div ref={ref} style={{
      background: "#060606", borderTop: `1px solid ${BORDER}`,
      padding: "12px 16px", height: 130, overflowY: "auto",
      fontFamily: "'Space Mono', monospace", fontSize: 10,
    }}>
      {entries.map((e, i) => (
        <div key={i} style={{
          color: e.type === "hit" ? ACCENT : e.type === "warn" ? "#FFD600" : e.type === "err" ? "#FF4444" : MUTED,
          marginBottom: 3, lineHeight: 1.5
        }}>
          <span style={{ color: "#333" }}>[{e.time}]</span> {e.msg}
        </div>
      ))}
      {entries.length === 0 && (
        <div style={{ color: "#333" }}>Waiting for analysis to start...</div>
      )}
    </div>
  );
}

function StreamInputPanel({ onStart, loading }) {
  const [url, setUrl] = useState("");
  const [streamer, setStreamer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [windowS, setWindowS] = useState(30);

  const detectPlatform = (u) => {
    if (u.includes("kick.com")) return "kick";
    if (u.includes("twitch.tv") || u.includes("twitch.com")) return "twitch";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    return null;
  };

  const platform = detectPlatform(url);
  const platformColors = { kick: "#53FC18", twitch: "#9146FF", youtube: "#FF0000" };

  return (
    <div style={{ padding: "28px 20px", overflowY: "auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: MUTED, fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>
          NEW SESSION
        </div>
        <h2 style={{ fontSize: 18, color: TEXT, fontWeight: 400, margin: 0, fontFamily: "Georgia, serif" }}>
          Start clipping
        </h2>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 9, letterSpacing: 2, color: MUTED, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
          VOD URL — KICK / TWITCH / YOUTUBE
        </label>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="kick.com/channel/videos/... or youtube.com/watch?v=..."
          style={{
            width: "100%", background: "#0d0d0d", border: `1px solid ${platform ? platformColors[platform] + "66" : BORDER}`,
            borderRadius: 6, padding: "10px 12px", color: TEXT,
            fontSize: 11, fontFamily: "'Space Mono', monospace", outline: "none",
            boxSizing: "border-box",
          }}
        />
        {platform && (
          <div style={{ fontSize: 9, color: platformColors[platform], fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
            ✓ {platform.toUpperCase()} detected
          </div>
        )}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 9, letterSpacing: 2, color: MUTED, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
          STREAMER NAME
        </label>
        <input
          value={streamer}
          onChange={e => setStreamer(e.target.value)}
          placeholder="TyriqueHyde"
          style={{
            width: "100%", background: "#0d0d0d", border: `1px solid ${BORDER}`,
            borderRadius: 6, padding: "10px 12px", color: TEXT,
            fontSize: 11, fontFamily: "'Space Mono', monospace", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 9, letterSpacing: 2, color: MUTED, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
          KEYWORDS (optional — leave blank for auto-detect)
        </label>
        <input
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="insane, crazy, no way, clutch..."
          style={{
            width: "100%", background: "#0d0d0d", border: `1px solid ${BORDER}`,
            borderRadius: 6, padding: "10px 12px", color: TEXT,
            fontSize: 11, fontFamily: "'Space Mono', monospace", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 9, letterSpacing: 2, color: MUTED, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
          WINDOW SIZE — {windowS}s per clip
        </label>
        <input
          type="range" min={10} max={60} step={5} value={windowS}
          onChange={e => setWindowS(Number(e.target.value))}
          style={{ width: "100%", accentColor: ACCENT }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#333", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
          <span>10s</span><span>60s</span>
        </div>
      </div>

      <button
        onClick={() => onStart(url, streamer, keywords, windowS)}
        disabled={loading || !url.trim()}
        style={{
          width: "100%", background: loading || !url.trim() ? "#1a1a1a" : ACCENT,
          border: "none", borderRadius: 6, padding: "13px",
          color: loading || !url.trim() ? MUTED : "#000", fontSize: 11,
          fontWeight: 700, letterSpacing: 2, cursor: loading || !url.trim() ? "not-allowed" : "pointer",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {loading ? "ANALYSING..." : "START CLIPPING →"}
      </button>
    </div>
  );
}

function FormatPicker({ selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {FORMATS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          style={{
            flex: 1, background: selected === f.id ? ACCENT + "22" : "#0d0d0d",
            border: `1px solid ${selected === f.id ? ACCENT : BORDER}`,
            borderRadius: 6, padding: "8px 4px", cursor: "pointer",
            color: selected === f.id ? ACCENT : MUTED,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <div style={{ fontSize: 16, marginBottom: 2 }}>{f.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 700 }}>{f.label}</div>
          <div style={{ fontSize: 8, color: MUTED, marginTop: 1 }}>{f.sub}</div>
        </button>
      ))}
    </div>
  );
}

function ClipCard({ clip, selected, onClick }) {
  const score = clip.score || clip.virality_score || 0;
  const color = score >= 80 ? ACCENT : score >= 60 ? "#FFD600" : "#FF6B35";
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? SURFACE2 : SURFACE,
        border: `1px solid ${selected ? ACCENT : BORDER}`,
        borderRadius: 8, padding: "12px 14px", cursor: "pointer",
        marginBottom: 8, display: "flex", gap: 12, alignItems: "center",
      }}
    >
      <ScoreRing score={score} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: TEXT, fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>
          {clip.title || `Clip at ${clip.timestamp_start || "unknown"}`}
        </div>
        <div style={{ fontSize: 10, color: MUTED, fontFamily: "'Space Mono', monospace" }}>
          {clip.timestamp_start ? formatTime(clip.timestamp_start) : ""}{clip.timestamp_end ? ` → ${formatTime(clip.timestamp_end)}` : ""}
          {clip.duration_s ? ` · ${Math.round(clip.duration_s)}s` : ""}
        </div>
        {clip.reasons && clip.reasons.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
            {clip.reasons.slice(0, 2).map((r, i) => (
              <span key={i} style={{ fontSize: 8, color: color, background: color + "15", padding: "1px 5px", borderRadius: 3, fontFamily: "'Space Mono', monospace" }}>
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(secs) {
  if (!secs && secs !== 0) return "";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ClipDetailPanel({ clip, sessionId, streamer, videoUrl, onDownload }) {
  const [format, setFormat] = useState("9:16");
  const [downloading, setDownloading] = useState(false);

  if (!clip) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
        <div style={{ fontSize: 11, color: "#333", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>SELECT A CLIP</div>
      </div>
    </div>
  );

  const score = clip.score || clip.virality_score || 0;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload(clip, format);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, color: TEXT, fontWeight: 400, fontFamily: "Georgia, serif", marginBottom: 6, lineHeight: 1.4 }}>
          {clip.title || `Clip at ${formatTime(clip.timestamp_start)}`}
        </div>
        <div style={{ fontSize: 11, color: MUTED, fontFamily: "'Space Mono', monospace" }}>
          {streamer || "Unknown"} · {formatTime(clip.timestamp_start)} → {formatTime(clip.timestamp_end)} · {Math.round(clip.duration_s || 0)}s
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Clip Score", value: score, color: score >= 80 ? ACCENT : "#FFD600" },
          { label: "Virality", value: clip.virality_score || score, color: "#7C3AED" },
          { label: "Duration", value: `${Math.round(clip.duration_s || 0)}s`, color: "#0EA5E9" },
        ].map(s => (
          <div key={s.label} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {clip.reasons && clip.reasons.length > 0 && (
        <div style={{ background: "#0d1a12", border: "1px solid #00FF8522", borderRadius: 8, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#00FF8566", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>
            WHY THIS CLIP
          </div>
          {clip.reasons.map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: "#888", lineHeight: 1.6, marginBottom: 2 }}>• {r}</div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: MUTED, fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>
          OUTPUT FORMAT
        </div>
        <FormatPicker selected={format} onChange={setFormat} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            flex: 1, background: downloading ? "#1a1a1a" : ACCENT,
            border: "none", borderRadius: 6, padding: "13px",
            color: downloading ? MUTED : "#000", fontSize: 11,
            fontWeight: 700, letterSpacing: 1.5, cursor: downloading ? "not-allowed" : "pointer",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {downloading ? "EXPORTING..." : `DOWNLOAD ${format}`}
        </button>
      </div>
    </div>
  );
}

export default function ClipprApp() {
  const [view, setView] = useState("landing");
  const [loading, setLoading] = useState(false);
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [streamer, setStreamer] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const pollRef = useRef(null);

  const addLog = (msg, type = "info") => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLogEntries(prev => [...prev.slice(-80), { msg, type, time }]);
  };

  const handleStart = async (url, streamerName, keywords, windowS) => {
    setVideoUrl(url);
    setLoading(true);
    setClips([]);
    setSelectedClip(null);
    setLogEntries([]);
    setError(null);
    setProgress(0);
    setStreamer(streamerName || "streamer");
    setView("app");

    addLog(`Starting analysis for: ${url}`, "info");
    addLog(`Streamer: ${streamerName || "unknown"} · Window: ${windowS}s`, "info");

    try {
      const res = await fetch(`${API}/api/upload/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: videoUrl,
          streamer: streamerName || "streamer",
          keywords: keywords ? keywords.split(",").map(k => k.trim()).filter(Boolean) : [],
          window_s: windowS,
          step_s: windowS,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const sid = data.session_id;
      setSessionId(sid);
      addLog(`Session started: ${sid}`, "info");
      addLog("Downloading VOD...", "info");

      // Open SSE stream for progress
      pollRef.current = new EventSource(`${API}/api/upload/events/${sid}`);
      pollRef.current.addEventListener("phase", (msg) => {
        try { const d = JSON.parse(msg.data); addLog(d.message || d.phase || "phase", "info"); } catch {}
      });
      pollRef.current.addEventListener("download_progress", (msg) => {
        try { const d = JSON.parse(msg.data); setProgress(d.pct || 0); if (d.message) addLog(d.message, "info"); } catch {}
      });
      pollRef.current.addEventListener("analysis_progress", (msg) => {
        try { const d = JSON.parse(msg.data); setProgress(d.pct || 0); if (d.message) addLog(d.message, "info"); } catch {}
      });
      pollRef.current.addEventListener("done", (msg) => {
      try {
        const d = JSON.parse(msg.data);
        if (Array.isArray(d.clips)) {
          setClips(d.clips);
          addLog(`Found ${d.clips.length} clips`, "info");
          if (d.clips.length > 0) setSelectedClip(d.clips[0]);
        }
      } catch (e) {
        addLog(`Parse error: ${e.message}`, "err");
      }
      addLog("Analysis complete", "info");
      pollRef.current.close();
      setLoading(false);
    });
      pollRef.current.addEventListener("error", (msg) => {
        try { const d = JSON.parse(msg.data); addLog(`× ${d.message || "error"}`, "err"); } catch {}
        pollRef.current.close();
        setLoading(false);
      });
      pollRef.current.addEventListener("end", () => {
        pollRef.current.close();
      });

    } catch (err) {
      setLoading(false);
      setError(err.message);
      addLog(`✗ ${err.message}`, "err");
    }
  };

  const fetchClips = async (sid) => {
    try {
      const res = await fetch(`${API}/api/session/${sid}/clips`);
      if (!res.ok) throw new Error("Failed to fetch clips");
      const data = await res.json();
      const clipList = data.clips || [];
      setClips(clipList);
      if (clipList.length > 0) setSelectedClip(clipList[0]);
      addLog(`Loaded ${clipList.length} clips`, "info");
    } catch (e) {
      addLog(`Failed to load clips: ${e.message}`, "err");
    }
  };

  const handleDownload = async (clip, format) => {
    try {
      const start_s = clip.timestamp_start ?? 0;
      const end_s = clip.timestamp_end ?? (start_s + (clip.duration_s ?? 30));
      const duration = Math.max(1, end_s - start_s);
      const res = await fetch(`${API}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: videoUrl,
          start_s,
          end_s,
          duration,
          title: clip.title || `clip_${clip.clip_index ?? 0}`,
          format,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Export failed: ${res.status} ${errText}`);
      }
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `${(clip.title || "clip").replace(/[^a-zA-Z0-9]/g, "_")}_${format.replace(":", "x")}.mp4`;
      a.click();
      URL.revokeObjectURL(dlUrl);
      addLog(`Downloaded ${a.download}`, "hit");
    } catch (e) {
      addLog(`Export error: ${e.message}`, "err");
    }
  };

  useEffect(() => {
    return () => { if (pollRef.current) pollRef.current?.close?.(); };
  }, []);

  // Landing
  if (view === "landing") {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "Georgia, serif", display: "flex", flexDirection: "column" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, background: ACCENT, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 13, color: "#000", fontWeight: 900, fontFamily: "'Space Mono', monospace" }}>C</span>
            </div>
            <span style={{ fontSize: 15, letterSpacing: 3, fontFamily: "'Space Mono', monospace", color: TEXT }}>CLIPPR</span>
          </div>
          <button
            onClick={() => setView("app")}
            style={{ background: ACCENT, border: "none", borderRadius: 5, padding: "8px 20px", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
            LAUNCH APP
          </button>
        </nav>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: ACCENT, fontFamily: "'Space Mono', monospace", marginBottom: 24, background: "#00FF8511", padding: "6px 16px", borderRadius: 20, border: "1px solid #00FF8533" }}>
            KICK · TWITCH · YOUTUBE
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 400, lineHeight: 1.1, margin: "0 0 24px", maxWidth: 680 }}>
            Your stream's best moments,<br />
            <span style={{ color: ACCENT }}>cut automatically.</span>
          </h1>
          <p style={{ fontSize: 15, color: MUTED, maxWidth: 500, lineHeight: 1.7, margin: "0 0 48px" }}>
            Paste a VOD URL. Clippr analyses the audio, scores every window, and gives you downloadable clips in 9:16, 16:9, or 1:1.
          </p>
          <button
            onClick={() => setView("app")}
            style={{ background: ACCENT, border: "none", borderRadius: 6, padding: "16px 36px", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: 2, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
            START CLIPPING →
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 80, maxWidth: 760, width: "100%" }}>
            {[
              { icon: "🎯", title: "Multi-Platform", desc: "Works with Kick, Twitch, and YouTube VODs. Paste any URL." },
              { icon: "🔊", title: "Audio Scoring", desc: "Energy, laughter, silence, and keyword detection across every 30s window." },
              { icon: "📐", title: "Format Selection", desc: "Export each clip as 9:16 for TikTok, 16:9 for YouTube, or 1:1 for Instagram." },
            ].map((f, i) => (
              <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "22px 18px", textAlign: "left" }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, fontFamily: "'Space Mono', monospace", color: "#ccc" }}>{f.title}</div>
                <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // App view
  const readyCount = clips.length;

  return (
    <div style={{ height: "100vh", background: BG, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 48, borderBottom: `1px solid ${BORDER}`,
        background: "#090909", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 20, background: ACCENT, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, color: "#000", fontWeight: 900, fontFamily: "'Space Mono', monospace" }}>C</span>
            </div>
            <span style={{ fontSize: 12, letterSpacing: 3, fontFamily: "'Space Mono', monospace", color: "#888" }}>CLIPPR</span>
          </div>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, background: "#FFD600", borderRadius: "50%", animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: 10, color: "#FFD600", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
                ANALYSING {progress > 0 ? `${progress}%` : ""}
              </span>
            </div>
          )}
          {error && (
            <span style={{ fontSize: 10, color: "#FF4444", fontFamily: "'Space Mono', monospace" }}>✗ {error}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {readyCount > 0 && (
            <span style={{ fontSize: 10, color: ACCENT, fontFamily: "'Space Mono', monospace" }}>{readyCount} CLIPS</span>
          )}
          <span onClick={() => { setView("landing"); pollRef.current?.close?.(); }} style={{ fontSize: 10, color: "#444", fontFamily: "'Space Mono', monospace", cursor: "pointer", letterSpacing: 1 }}>
            ← HOME
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {loading && progress > 0 && (
        <div style={{ height: 2, background: BORDER }}>
          <div style={{ height: "100%", width: `${progress}%`, background: ACCENT, transition: "width 0.5s" }} />
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left panel */}
        <div style={{ width: 300, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
          {clips.length === 0 ? (
            <StreamInputPanel onStart={handleStart} loading={loading} />
          ) : (
            <>
              <div style={{ padding: "14px 16px 6px" }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: MUTED, fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>
                  {clips.length} CLIPS FOUND
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "0 14px" }}>
                {clips.map((clip, i) => (
                  <ClipCard
                    key={i}
                    clip={clip}
                    selected={selectedClip === clip}
                    onClick={() => setSelectedClip(clip)}
                  />
                ))}
                <button
                  onClick={() => { setClips([]); setSelectedClip(null); setSessionId(null); setError(null); setLogEntries([]); }}
                  style={{
                    width: "100%", background: "transparent", border: `1px solid ${BORDER}`,
                    borderRadius: 6, padding: "9px", color: MUTED,
                    fontSize: 9, cursor: "pointer", fontFamily: "'Space Mono', monospace",
                    letterSpacing: 1, marginTop: 6, marginBottom: 14,
                  }}>
                  + NEW SESSION
                </button>
              </div>
            </>
          )}
          <DetectionLog entries={logEntries} />
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {clips.length === 0 && !loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🎬</div>
                <div style={{ fontSize: 11, color: "#333", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>
                  PASTE A VOD URL TO BEGIN
                </div>
                <div style={{ fontSize: 10, color: "#2a2a2a", fontFamily: "'Space Mono', monospace", marginTop: 6 }}>
                  KICK · TWITCH · YOUTUBE
                </div>
              </div>
            </div>
          ) : loading && clips.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 44, height: 44, border: `2px solid ${BORDER}`, borderTop: `2px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 20 }} />
              <div style={{ fontSize: 11, color: MUTED, fontFamily: "'Space Mono', monospace", letterSpacing: 2, marginBottom: 8 }}>
                {progress > 0 ? `ANALYSING ${progress}%` : "DOWNLOADING VOD..."}
              </div>
              <div style={{ fontSize: 9, color: "#333", fontFamily: "'Space Mono', monospace" }}>
                This may take a few minutes for longer VODs
              </div>
            </div>
          ) : (
            <ClipDetailPanel
              clip={selectedClip}
              sessionId={sessionId}
              streamer={streamer}
          videoUrl={videoUrl}
              onDownload={handleDownload}
            />
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 2px; }
        input::placeholder { color: #333; }
        input[type=range] { height: 4px; cursor: pointer; }
      `}</style>
    </div>
  );
}
