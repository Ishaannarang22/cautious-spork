let firecrawlApp;

async function ensureFirecrawlApp() {
  if (!firecrawlApp) {
    const module = await import('@mendable/firecrawl-js');
    firecrawlApp = module.default;
  }
  return firecrawlApp;
}

async function createFirecrawlClient() {
  const FirecrawlApp = await ensureFirecrawlApp();
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error('Missing FIRECRAWL_API_KEY in environment');
  }
  return new FirecrawlApp({ apiKey });
}

async function searchUrls(client, query, limit = 5, options = {}) {
  try {
    const response = await client.search(query, { limit, ...options });
    if (!response || !Array.isArray(response.data)) return [];
    return response.data.map((item) => item.url).filter(Boolean);
  } catch (error) {
    console.error(`[Firecrawl] search failed for "${query}"`, error?.message ?? error);
    return [];
  }
}

async function scrapeUrl(client, url) {
  const response = await client.scrapeUrl(url, {
    formats: ['markdown', 'html'],
    includeTags: ['title'],
    excludeTags: ['script', 'style', 'noscript']
  });

  if (!response || !response.data) {
    return null;
  }

  return {
    url,
    title: response.data.title || null,
    markdown: response.data.markdown || '',
    html: response.data.html || ''
  };
}

module.exports = {
  createFirecrawlClient,
  searchUrls,
  scrapeUrl
};
