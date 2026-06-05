const BASE = import.meta.env.VITE_API_URL || "https://api.clippr.org";

export async function* streamClips(videoUrl, googleToken = null) {
  const body = { url: videoUrl };
  if (googleToken) body.google_token = googleToken;

  const res = await fetch(`${BASE}/api/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Backend error: ${res.status}`);
  }

  const { session_id } = await res.json();
  if (!session_id) throw new Error("No session_id returned");

  const streamRes = await fetch(`${BASE}/api/session/${session_id}/events`);
  if (!streamRes.ok) throw new Error(`Stream error: ${streamRes.status}`);

  const reader = streamRes.body.getReader();
  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop();
    for (const part of parts) {
      if (part.startsWith(":")) continue;
      const lines = part.split("\n");
      let eventType = "message";
      let dataStr = "";
      for (const line of lines) {
        if (line.startsWith("event:")) eventType = line.slice(6).trim();
        else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
      }
      if (!dataStr) continue;
      try {
        const data = JSON.parse(dataStr);
        yield { type: eventType, ...data };
      } catch {}
    }
  }
}

export async function exportClip({ videoUrl, startS, endS, title, format = "9:16", sessionId = null }) {
  const res = await fetch(`${BASE}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_url: videoUrl, start_s: startS, end_s: endS, format, title, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.blob();
}
