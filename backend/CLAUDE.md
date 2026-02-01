# LitiGate Backend

Express.js API server with OpenAI and Firecrawl integration for person research and breach analysis.

## Quick Start

```bash
npm install
npm run dev    # Start dev server with hot reload (port 3001)
```

## Tech Stack

- **Express.js** - HTTP server
- **TypeScript** - Type safety
- **OpenAI SDK** - GPT-4o-mini for parsing and analysis
- **Firecrawl** - Web search and scraping
- **tsx** - TypeScript execution with hot reload

## Project Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env                      # API keys (not committed)
└── src/
    ├── index.ts              # Express server entry point
    ├── config.ts             # Environment configuration
    ├── services/
    │   └── firecrawl.ts      # Firecrawl API wrapper
    ├── agents/
    │   ├── index.ts          # Agent exports
    │   ├── personResearch.ts # Agent 1: Person research
    │   └── breachAnalysis.ts # Agent 2: Breach analysis
    └── routes/
        └── api.ts            # API endpoints
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with service status |
| `/api/discover/user` | POST | Person research (Agent 1) |
| `/api/discover/company` | POST | Company research |
| `/api/analyze` | POST | Breach analysis (Agent 2) |
| `/api/full-scan` | POST | Combined flow (all agents) |

## Environment Variables

Create `.env` file:
```
PORT=3001
FIRECRAWL_API_KEY=fc-...
OPENAI_API_KEY=sk-proj-...
```

## Agents

### Agent 1: Person Research (`personResearch.ts`)

Uses Firecrawl to search for a person's online presence, then OpenAI to parse results.

**Input:** `{ name, email?, phone? }`

**Process:**
1. Search LinkedIn, Twitter, GitHub for profiles
2. Search data breach databases
3. Search data broker sites (Spokeo, Whitepages, etc.)
4. Use GPT-4o-mini to parse and structure results

**Output:** `DiscoveredUserData`
```typescript
{
  socialProfiles: [{ platform, url, username }],
  dataBreaches: [{ name, date, dataTypes }],
  publicRecords: [{ type, details }],
  onlinePresence: [{ site, info }]
}
```

### Agent 2: Breach Analysis (`breachAnalysis.ts`)

Analyzes discovered data for privacy violations and generates legal documents.

**Input:** `{ userData, companyData?, userName? }`

**Process:**
1. Extract company names from breaches
2. Search for additional breach information
3. Use GPT-4o-mini to analyze eligibility and generate documents

**Output:** `AnalysisResult`
```typescript
{
  redactoResults: [{
    category: string,
    findings: [{ item, risk: 'high'|'medium'|'low', action }]
  }],
  drafts: [{
    id, type, title, content, status: 'pending'
  }]
}
```

## Firecrawl Service (`firecrawl.ts`)

Wrapper around Firecrawl API for web search and scraping.

**Functions:**
- `searchPerson(name, email?, phone?)` - Search for person's online presence
- `searchDataBrokers(name)` - Search data broker sites
- `searchCompanyBreaches(company)` - Search for company data breaches
- `searchCompanyInfo(company)` - Search for company information
- `scrapeUrl(url)` - Scrape a specific URL

## Fallback Behavior

All endpoints have fallback data generators when APIs are unavailable:
- `generateFallbackUserData(name)` - Mock user discovery data
- `generateFallbackCompanyData(company)` - Mock company data
- `generateFallbackAnalysis(userData)` - Mock breach analysis

This allows the frontend to work in "offline mode" without API keys.

## Commands

```bash
npm run dev      # Start with hot reload
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled JS from dist/
```
