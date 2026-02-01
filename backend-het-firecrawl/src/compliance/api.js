const express = require('express');
const { createFirecrawlClient } = require('./firecrawlClient');
const { analyzeCompany } = require('./analyzeCompany');
const { stableId } = require('./utils');
const { runBreachCheck } = require('./breachCheck');

const router = express.Router();

function buildOutputRecord(companyResult, crawlTimestamp) {
  const findings = companyResult.findings;
  const confidence =
    findings.robocalls.sources.length || findings.data_breaches.sources.length || findings.ccpa.sources.length
      ? 'medium'
      : 'low';

  return {
    company_name: companyResult.company_name,
    verticals_analyzed: companyResult.verticals_analyzed,
    findings: companyResult.findings,
    crawl_timestamp: crawlTimestamp,
    confidence
  };
}

function normalizeCompanies(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

router.post('/run', async (req, res) => {
  try {
    const companies = normalizeCompanies(req.body?.companies ?? req.body);
    if (!companies.length) {
      return res.status(400).json({
        error: 'Provide a JSON array of companies under `companies` or as the request body.'
      });
    }

    console.log('[Compliance API] running crawl for', companies.length, 'company(ies)');
    const client = await createFirecrawlClient();
    const crawlTimestamp = new Date().toISOString();
    const results = [];

    for (const company of companies) {
      if (!company || !company.company_name) continue;
      const analysis = await analyzeCompany(client, company, { limitPerQuery: 5 });
      const record = buildOutputRecord(analysis, crawlTimestamp);
      record.record_id = stableId(`${company.company_name}-${crawlTimestamp}`);
      results.push(record);
    }

    return res.json({
      crawl_timestamp: crawlTimestamp,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('[Compliance API] failed', error);
    return res.status(500).json({
      error: error.message || 'Compliance crawl failed.'
    });
  }
});

router.post('/breach-check', async (req, res) => {
  try {
    const entries = normalizeCompanies(req.body?.entries ?? req.body);
    if (!entries.length) {
      return res.status(400).json({
        error: 'Provide a JSON array of entries under `entries` or as the request body.'
      });
    }

    console.log('[BreachCheck API] running breach check for', entries.length, 'entr(ies)');
    const options = {
      mode: req.body?.mode,
      limitPerQuery: req.body?.limitPerQuery,
      timeout: req.body?.timeout
    };
    const results = await runBreachCheck(entries, options);
    return res.json({ count: results.length, results });
  } catch (error) {
    console.error('[BreachCheck API] failed', error);
    return res.status(500).json({
      error: error.message || 'Breach check failed.'
    });
  }
});

module.exports = router;
