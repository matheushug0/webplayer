module.exports = async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).end('Missing url');

  const target = decodeURIComponent(url);

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!upstream.ok) return res.status(upstream.status).end();

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');

    if (target.includes('.m3u8')) {
      const text = await upstream.text();
      const baseUrl = target.substring(0, target.lastIndexOf('/') + 1);
      const rewritten = text.split('\n').map(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return line;
        const abs = line.startsWith('http') ? line : baseUrl + line;
        return '/api/stream?url=' + encodeURIComponent(abs);
      }).join('\n');
      return res.status(200).send(rewritten);
    }

    const buffer = await upstream.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).end(e.message);
  }
};
