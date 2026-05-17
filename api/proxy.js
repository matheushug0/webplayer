export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  const target = decodeURIComponent(url);

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', contentType);

    if (target.includes('.m3u8')) {
      const text = await upstream.text();
      const baseUrl = target.substring(0, target.lastIndexOf('/') + 1);
      const rewritten = text.split('\n').map(line => {
        const t = line.trim();
        if (!t || t.startsWith('#')) return line;
        const abs = t.startsWith('http') ? t : baseUrl + t;
        return '/api/proxy?url=' + encodeURIComponent(abs);
      }).join('\n');
      return res.status(upstream.status).send(rewritten);
    }

    const buffer = await upstream.arrayBuffer();
    res.status(upstream.status).send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
