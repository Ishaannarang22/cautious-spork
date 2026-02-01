const { createFirecrawlClient, searchUrls, scrapeUrl } = require('./firecrawlClient');
const { extractDataBreachSignals } = require('./extractors/dataBreaches');
const { uniqueStrings, pickFirstDate } = require('./utils');

const RELATION_MAP = {
  phone: ['phone', 'telephone', 'mobile'],
  email: ['email'],
  address: ['address', 'mailing'],
  mailing: ['address', 'mailing']
};

function normalizeRelation(input) {
  if (!input) return null;
  const lowered = String(input).toLowerCase().trim();
  if (lowered.includes('phone') || lowered.includes('telephone') || lowered.includes('mobile')) return 'phone';
  if (lowered.includes('email')) return 'email';
  if (lowered.includes('address') || lowered.includes('mail')) return 'address';
  return null;
}

function buildBreachQueries(companyName) {
  return [
    `site:oag.ca.gov "${companyName}" "data breach"`,
    `"${companyName}" "data breach" "California"`,
    `"${companyName}" "breach notice" "California"`,
    `"${companyName}" "security incident"`,
    `"${companyName}" "breach notification letter"`
  ];
}

function buildQuickBreachQueries(companyName, relation) {
  const relationText = relation ? String(relation).trim() : '';
  const relationQuoted = relationText ? `"${relationText}"` : '';

  const queries = [];
  if (relationQuoted) {
    queries.push(`"${companyName}" ${relationQuoted} "data breach"`);
    queries.push(`"${companyName}" ${relationQuoted}`);
  }
  queries.push(`"${companyName}" "data breach"`);
  queries.push(`${companyName} ${relationText}`.trim());
  queries.push(`"${companyName}" "security incident"`);

  return uniqueStrings(queries.filter(Boolean));
}

async function gatherUrlsQuick(client, queries, limitPerQuery, searchOptions) {
  const urls = [];
  for (const query of queries) {
    const found = await searchUrls(client, query, limitPerQuery, searchOptions);
    urls.push(...found);
    if (uniqueStrings(urls).length >= limitPerQuery) break;
  }
  return uniqueStrings(urls).slice(0, limitPerQuery);
}

function formatTbsDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function buildTbsForYears(years) {
  const now = new Date();
  const min = new Date(now);
  min.setFullYear(now.getFullYear() - years);
  return `cdr:1,cd_min:${formatTbsDate(min)},cd_max:${formatTbsDate(now)}`;
}

function isWithinYears(dateString, years) {
  if (!dateString) return false;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setFullYear(now.getFullYear() - years);
  return parsed >= cutoff && parsed <= now;
}

async function gatherUrls(client, queries, limitPerQuery, searchOptions) {
  const urls = [];
  for (const query of queries) {
    const found = await searchUrls(client, query, limitPerQuery, searchOptions);
    urls.push(...found);
  }
  return uniqueStrings(urls);
}

async function scrapeUrls(client, urls) {
  const pages = [];
  for (const url of urls) {
    try {
      const result = await scrapeUrl(client, url);
      if (result && (result.markdown || result.html)) {
        pages.push({
          url: result.url,
          text: result.markdown || result.html || ''
        });
      }
    } catch (error) {
      console.error('[BreachCheck] failed to scrape', url, error?.message ?? error);
      pages.push({ url, text: '' });
    }
  }
  return pages;
}

function pageMatchesRelation(dataTypesAffected, relation) {
  if (!relation) return true;
  const required = RELATION_MAP[relation] || [];
  return dataTypesAffected.some((item) => required.includes(item));
}

function pickDisclosureDate(pageText, extractedDate) {
  return extractedDate || pickFirstDate(pageText);
}

async function runBreachCheck(entries, options = {}) {
  const mode = options.mode || 'search';
  const isDeepScan = mode === 'deep';
  const limitPerQuery = options.limitPerQuery || (isDeepScan ? 3 : 2);
  const searchOptions = {
    timeout: options.timeout || (isDeepScan ? 60000 : 15000),
    sources: ['news', 'web']
  };
  if (isDeepScan) {
    searchOptions.tbs = buildTbsForYears(2);
  }
  const client = await createFirecrawlClient();
  const results = [];

  for (const entry of entries) {
    if (!entry || !entry.company_name) continue;
    const relation = normalizeRelation(entry.relation);
    const companyName = entry.company_name;

    console.log(`[BreachCheck] analyzing ${companyName} (${relation || 'any relation'})`);
    if (!isDeepScan) {
      const queries = buildQuickBreachQueries(companyName, relation || entry.relation);
      const uniqueUrls = await gatherUrlsQuick(client, queries, limitPerQuery, searchOptions);
      console.log(`[BreachCheck] quick search found ${uniqueUrls.length} URLs`);

      results.push({
        company_name: companyName,
        relation: relation || entry.relation || null,
        breach_in_last_2_years: null,
        breach_disclosure_date: null,
        data_types_affected: [],
        sources: uniqueUrls.map((url) => ({
          url,
          breach_disclosure_date: null,
          data_types_affected: []
        })),
        mode: 'search'
      });
      continue;
    }

    const urls = await gatherUrls(client, buildBreachQueries(companyName), limitPerQuery, searchOptions);
    console.log(`[BreachCheck] found ${urls.length} URLs`);

    const pages = await scrapeUrls(client, urls);
    const matches = [];
    const dataTypes = new Set();

    pages.forEach((page) => {
      const signal = extractDataBreachSignals(page);
      if (!signal.breachDisclosed) return;

      const disclosureDate = pickDisclosureDate(page.text, signal.breachDisclosureDate);
      if (!isWithinYears(disclosureDate, 2)) return;

      if (!pageMatchesRelation(signal.dataTypesAffected, relation)) return;

      signal.dataTypesAffected.forEach((item) => dataTypes.add(item));
      matches.push({
        url: page.url,
        breach_disclosure_date: disclosureDate || null,
        data_types_affected: signal.dataTypesAffected
      });
    });

    const uniqueUrls = uniqueStrings(matches.map((item) => item.url));
    const mergedSources = uniqueUrls.map((url) => {
      const pageMatch = matches.find((item) => item.url === url);
      return {
        url,
        breach_disclosure_date: pageMatch?.breach_disclosure_date || null,
        data_types_affected: pageMatch?.data_types_affected || []
      };
    });

    results.push({
      company_name: companyName,
      relation: relation || entry.relation || null,
      breach_in_last_2_years: mergedSources.length > 0,
      breach_disclosure_date: mergedSources[0]?.breach_disclosure_date || null,
      data_types_affected: Array.from(dataTypes),
      sources: mergedSources
    });
  }

  return results;
}

module.exports = {
  runBreachCheck
};
