// Cloudflare Worker — cole em https://workers.cloudflare.com
const WORKER_URL = 'https://worker.mateus-hugo-mh.workers.dev';

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get('url');
    if (!target) return new Response('Missing url', { status: 400 });

    const decoded = decodeURIComponent(target);

    const upstream = await fetch(decoded, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') || '';
    const isM3u8 = decoded.includes('.m3u8') || contentType.includes('mpegurl');

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Content-Type': isM3u8 ? 'application/vnd.apple.mpegurl' : contentType,
    };

    if (isM3u8) {
      const text = await upstream.text();
      const baseUrl = decoded.substring(0, decoded.lastIndexOf('/') + 1);
      const rewritten = text.split('\n').map(line => {
        const t = line.trim();
        if (!t || t.startsWith('#')) return line;
        const abs = t.startsWith('http') ? t : baseUrl + t;
        return WORKER_URL + '/?url=' + encodeURIComponent(abs);
      }).join('\n');
      return new Response(rewritten, { status: upstream.status, headers });
    }

    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
