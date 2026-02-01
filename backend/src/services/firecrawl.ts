import Firecrawl from 'firecrawl';
import { config } from '../config.js';

const firecrawl = new Firecrawl({ apiKey: config.firecrawlApiKey });

export interface SearchResult {
  url: string;
  title: string;
  description: string;
  content?: string;
}

export interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  markdown?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Search for a person's online presence using Firecrawl
 */
export async function searchPerson(
  name: string,
  email?: string,
  phone?: string
): Promise<SearchResult[]> {
  const queries: string[] = [];

  // Build search queries
  if (name) {
    queries.push(`"${name}" site:linkedin.com`);
    queries.push(`"${name}" site:twitter.com OR site:x.com`);
    queries.push(`"${name}" site:github.com`);
    queries.push(`"${name}" professional profile`);
  }

  if (email) {
    queries.push(`"${email}" data breach`);
    queries.push(`"${email}" leaked`);
  }

  const results: SearchResult[] = [];

  for (const query of queries) {
    try {
      const searchResponse = await firecrawl.search(query, {
        limit: 5,
      });

      if (searchResponse.success && searchResponse.data) {
        for (const result of searchResponse.data) {
          results.push({
            url: result.url || '',
            title: result.title || '',
            description: result.description || '',
            content: result.markdown || '',
          });
        }
      }
    } catch (error) {
      console.error(`Search error for query "${query}":`, error);
    }
  }

  return results;
}

/**
 * Scrape a specific URL for detailed information
 */
export async function scrapeUrl(url: string): Promise<ScrapeResult | null> {
  try {
    const response = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
    });

    // The scrape response has document properties directly on the response object
    if (response.success) {
      return {
        url,
        title: response.metadata?.title || '',
        content: response.markdown || '',
        markdown: response.markdown,
        metadata: response.metadata as Record<string, unknown>,
      };
    }

    return null;
  } catch (error) {
    console.error(`Scrape error for URL "${url}":`, error);
    return null;
  }
}

/**
 * Search for data breaches affecting a company
 */
export async function searchCompanyBreaches(
  companyName: string
): Promise<SearchResult[]> {
  const queries = [
    `"${companyName}" data breach`,
    `"${companyName}" security incident`,
    `"${companyName}" CCPA violation`,
    `"${companyName}" class action lawsuit data`,
    `"${companyName}" settlement breach`,
  ];

  const results: SearchResult[] = [];

  for (const query of queries) {
    try {
      const searchResponse = await firecrawl.search(query, {
        limit: 5,
      });

      if (searchResponse.success && searchResponse.data) {
        for (const result of searchResponse.data) {
          results.push({
            url: result.url || '',
            title: result.title || '',
            description: result.description || '',
            content: result.markdown || '',
          });
        }
      }
    } catch (error) {
      console.error(`Company breach search error for "${query}":`, error);
    }
  }

  return results;
}

/**
 * Search for company information
 */
export async function searchCompanyInfo(
  companyName: string
): Promise<SearchResult[]> {
  const queries = [
    `"${companyName}" company information`,
    `"${companyName}" site:linkedin.com/company`,
    `"${companyName}" executives leadership team`,
    `"${companyName}" news recent`,
  ];

  const results: SearchResult[] = [];

  for (const query of queries) {
    try {
      const searchResponse = await firecrawl.search(query, {
        limit: 5,
      });

      if (searchResponse.success && searchResponse.data) {
        for (const result of searchResponse.data) {
          results.push({
            url: result.url || '',
            title: result.title || '',
            description: result.description || '',
            content: result.markdown || '',
          });
        }
      }
    } catch (error) {
      console.error(`Company info search error for "${query}":`, error);
    }
  }

  return results;
}

/**
 * Search for data broker listings
 */
export async function searchDataBrokers(name: string): Promise<SearchResult[]> {
  const brokers = [
    'spokeo',
    'whitepages',
    'beenverified',
    'intelius',
    'peoplefinder',
    'radaris',
    'mylife',
    'pipl',
  ];

  const results: SearchResult[] = [];

  for (const broker of brokers) {
    try {
      const searchResponse = await firecrawl.search(`"${name}" site:${broker}.com`, {
        limit: 2,
      });

      if (searchResponse.success && searchResponse.data) {
        for (const result of searchResponse.data) {
          results.push({
            url: result.url || '',
            title: result.title || '',
            description: result.description || '',
            content: result.markdown || '',
          });
        }
      }
    } catch (error) {
      console.error(`Data broker search error for ${broker}:`, error);
    }
  }

  return results;
}
