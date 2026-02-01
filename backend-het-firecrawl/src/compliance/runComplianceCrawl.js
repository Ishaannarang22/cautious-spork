const fs = require('fs');
const path = require('path');
const { createFirecrawlClient } = require('./firecrawlClient');
const { analyzeCompany } = require('./analyzeCompany');
const { stableId } = require('./utils');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

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

async function run() {
  const args = process.argv.slice(2);
  const inputArgIndex = args.indexOf('--input');
  const outputArgIndex = args.indexOf('--output');
  const inputPath =
    inputArgIndex !== -1
      ? args[inputArgIndex + 1]
      : path.join(__dirname, 'data', 'companies.test.json');
  const outputPath =
    outputArgIndex !== -1
      ? args[outputArgIndex + 1]
      : path.join(__dirname, 'output', 'compliance-results.json');

  const crawlTimestamp = new Date().toISOString();
  const dataset = readJson(inputPath);
  const companies = Array.isArray(dataset) ? dataset : [];

  const client = await createFirecrawlClient();
  const results = [];

  for (const company of companies) {
    const analysis = await analyzeCompany(client, company, { limitPerQuery: 5 });
    const record = buildOutputRecord(analysis, crawlTimestamp);
    record.record_id = stableId(`${company.company_name}-${crawlTimestamp}`);
    results.push(record);
  }

  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Wrote ${results.length} records to ${outputPath}`);
}

run().catch((error) => {
  console.error('Compliance crawl failed:', error.message);
  process.exit(1);
});
