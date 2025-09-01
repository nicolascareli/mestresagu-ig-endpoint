// api/ig.js — Endpoint da Vercel pra buscar posts do Instagram
export default async function handler(req, res) {
  try {
    const { IG_TOKEN, IG_USER_ID } = process.env;
    if (!IG_TOKEN || !IG_USER_ID) {
      return res.status(500).json({ error: "Missing IG_TOKEN or IG_USER_ID" });
    }

    const fields = [
      "id","caption","media_type","media_url","thumbnail_url","permalink","timestamp"
    ].join(",");

    const url = `https://graph.instagram.com/${IG_USER_ID}/media?fields=${fields}&access_token=${IG_TOKEN}&limit=12`;

    const r = await fetch(url);
    const txt = await r.text();
    if (!r.ok) return res.status(r.status).send(txt);

    const json = JSON.parse(txt);

    const items = (json.data || [])
      .map(m => ({
        id: m.id,
        caption: m.caption || "",
        media_type: m.media_type,
        media_url: m.media_url || m.thumbnail_url || "",
        permalink: m.permalink,
        timestamp: m.timestamp
      }))
      .filter(m => m.media_url);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(items);
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
