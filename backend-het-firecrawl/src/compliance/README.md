# Compliance crawl (California public signals)

This folder adds a standalone, test-only compliance crawler that uses Firecrawl to gather **public** compliance signals for California-focused analysis.

It is intentionally isolated from the existing API and frontend code.

## What it does

Given a static list of companies, it:
- Searches public sources by category (robocalls/spam texts, data breaches, CCPA request disclosures)
- Scrapes the discovered pages
- Extracts **structured, factual signals**
- Outputs a deterministic, auditable JSON record per company

No legal conclusions are produced. All signals are tied to public source URLs.

## Quick start

1. Ensure the backend dependencies are installed and `FIRECRAWL_API_KEY` is set.
2. Run:

```bash
node src/compliance/runComplianceCrawl.js
```

Optional overrides:

```bash
node src/compliance/runComplianceCrawl.js --input src/compliance/data/companies.test.json --output src/compliance/output/compliance-results.json
```

## Output format

Each company produces a single record:

```json
{
  "company_name": "",
  "verticals_analyzed": ["robocalls", "data_breaches", "ccpa"],
  "findings": {
    "robocalls": {
      "calling_practices_disclosed": true,
      "text_marketing_disclosed": false,
      "opt_out_mechanism_described": true,
      "consent_language_present": false,
      "regulatory_actions_found": false,
      "sources": [
        {
          "url": "https://...",
          "fields_supported": ["opt_out_mechanism_described"],
          "snippets": ["..."]
        }
      ]
    },
    "data_breaches": {
      "public_breach_disclosed": false,
      "breach_disclosure_date": null,
      "data_types_affected": [],
      "california_notice_mentioned": false,
      "sources": []
    },
    "ccpa": {
      "ccpa_rights_disclosed": true,
      "request_methods_listed": ["email", "webform"],
      "response_timeline_stated": true,
      "verification_requirements_described": false,
      "privacy_policy_last_updated": "2024-01-01",
      "sources": []
    }
  },
  "crawl_timestamp": "2026-01-31T00:00:00.000Z",
  "confidence": "medium",
  "record_id": "..."
}
```

## Notes

- `sources` contain the public URLs used to support each field (via `fields_supported`).
- The extractor uses deterministic keyword-based rules to avoid subjective interpretation.
- This is a test harness for crawling and structured extraction only.
