const { uniqueStrings, sortByUrl } = require('./utils');
const { buildRobocallQueries, buildBreachQueries, buildCcpaQueries } = require('./targets');
const { searchUrls, scrapeUrl } = require('./firecrawlClient');
const { extractRobocallSignals } = require('./extractors/robocalls');
const { extractDataBreachSignals } = require('./extractors/dataBreaches');
const { extractCcpaSignals } = require('./extractors/ccpa');

async function gatherUrls(client, queries, limitPerQuery) {
  const urls = [];
  for (const query of queries) {
    const found = await searchUrls(client, query, limitPerQuery);
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
      console.error('[Compliance] failed to scrape', url, error?.message ?? error);
      pages.push({ url, text: '' });
    }
  }
  return pages;
}

function mergeSources(sourceMap) {
  const sources = Object.values(sourceMap)
    .filter((item) => item.fieldsSupported.length > 0)
    .map((item) => ({
      url: item.url,
      fields_supported: item.fieldsSupported.sort(),
      snippets: item.snippets
    }))
    .sort(sortByUrl);

  return sources;
}

function summarizeRobocalls(pages) {
  const sourceMap = {};
  const totals = {
    calling_practices_disclosed: false,
    text_marketing_disclosed: false,
    opt_out_mechanism_described: false,
    consent_language_present: false,
    regulatory_actions_found: false
  };

  pages.forEach((page) => {
    const result = extractRobocallSignals(page);
    if (!sourceMap[page.url]) {
      sourceMap[page.url] = result;
    } else {
      sourceMap[page.url].fieldsSupported = uniqueStrings([
        ...sourceMap[page.url].fieldsSupported,
        ...result.fieldsSupported
      ]);
      sourceMap[page.url].snippets = uniqueStrings([
        ...sourceMap[page.url].snippets,
        ...result.snippets
      ]).slice(0, 5);
    }

    result.fieldsSupported.forEach((field) => {
      totals[field] = true;
    });
  });

  return {
    ...totals,
    sources: mergeSources(sourceMap)
  };
}

function summarizeDataBreaches(pages) {
  const sourceMap = {};
  const totals = {
    public_breach_disclosed: false,
    breach_disclosure_date: null,
    data_types_affected: [],
    california_notice_mentioned: false
  };

  pages.forEach((page) => {
    const result = extractDataBreachSignals(page);
    if (!sourceMap[page.url]) {
      sourceMap[page.url] = result;
    } else {
      sourceMap[page.url].fieldsSupported = uniqueStrings([
        ...sourceMap[page.url].fieldsSupported,
        ...result.fieldsSupported
      ]);
      sourceMap[page.url].snippets = uniqueStrings([
        ...sourceMap[page.url].snippets,
        ...result.snippets
      ]).slice(0, 5);
    }

    if (result.breachDisclosed) totals.public_breach_disclosed = true;
    if (result.breachDisclosureDate && !totals.breach_disclosure_date) {
      totals.breach_disclosure_date = result.breachDisclosureDate;
    }
    totals.data_types_affected = uniqueStrings([
      ...totals.data_types_affected,
      ...result.dataTypesAffected
    ]);
    if (result.californiaNoticeMentioned) totals.california_notice_mentioned = true;
  });

  return {
    ...totals,
    sources: mergeSources(sourceMap)
  };
}

function summarizeCcpa(pages) {
  const sourceMap = {};
  const totals = {
    ccpa_rights_disclosed: false,
    request_methods_listed: [],
    response_timeline_stated: false,
    verification_requirements_described: false,
    privacy_policy_last_updated: null
  };

  pages.forEach((page) => {
    const result = extractCcpaSignals(page);
    if (!sourceMap[page.url]) {
      sourceMap[page.url] = result;
    } else {
      sourceMap[page.url].fieldsSupported = uniqueStrings([
        ...sourceMap[page.url].fieldsSupported,
        ...result.fieldsSupported
      ]);
      sourceMap[page.url].snippets = uniqueStrings([
        ...sourceMap[page.url].snippets,
        ...result.snippets
      ]).slice(0, 5);
    }

    if (result.ccpaDisclosed) totals.ccpa_rights_disclosed = true;
    totals.request_methods_listed = uniqueStrings([
      ...totals.request_methods_listed,
      ...result.requestMethods
    ]);
    if (result.responseTimelineStated) totals.response_timeline_stated = true;
    if (result.verificationRequirements) totals.verification_requirements_described = true;
    if (result.privacyPolicyLastUpdated && !totals.privacy_policy_last_updated) {
      totals.privacy_policy_last_updated = result.privacyPolicyLastUpdated;
    }
  });

  return {
    ...totals,
    sources: mergeSources(sourceMap)
  };
}

async function analyzeCompany(client, company, options = {}) {
  const limitPerQuery = options.limitPerQuery || 5;

  console.log(`[Compliance] analyzing ${company.company_name}`);
  const robocallUrls = await gatherUrls(client, buildRobocallQueries(company.company_name), limitPerQuery);
  console.log(`[Compliance] found ${robocallUrls.length} robocall URLs`);
  const breachUrls = await gatherUrls(client, buildBreachQueries(company.company_name), limitPerQuery);
  console.log(`[Compliance] found ${breachUrls.length} breach URLs`);
  const ccpaUrls = await gatherUrls(client, buildCcpaQueries(company.company_name), limitPerQuery);
  console.log(`[Compliance] found ${ccpaUrls.length} CCPA URLs`);

  const [robocallPages, breachPages, ccpaPages] = await Promise.all([
    scrapeUrls(client, robocallUrls),
    scrapeUrls(client, breachUrls),
    scrapeUrls(client, ccpaUrls)
  ]);

  console.log(
    `[Compliance] scraped ${robocallPages.length} robocall pages, ${breachPages.length} breach pages, ${ccpaPages.length} CCPA pages`
  );
  return {
    company_name: company.company_name,
    verticals_analyzed: ['robocalls', 'data_breaches', 'ccpa'],
    findings: {
      robocalls: summarizeRobocalls(robocallPages),
      data_breaches: summarizeDataBreaches(breachPages),
      ccpa: summarizeCcpa(ccpaPages)
    }
  };
}

module.exports = {
  analyzeCompany
};
