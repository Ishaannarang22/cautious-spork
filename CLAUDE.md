# LitiGate

Automated consumer rights enforcement system for California. Identifies potential statutory compensation eligibility and generates compliant legal documents.

## Architecture

```
┌─────────────────┐     ┌─────────────────────────────────────────┐
│   React Frontend │────▶│           Express Backend               │
│   (Port 8080)    │     │           (Port 3001)                   │
└─────────────────┘     │                                         │
                        │  ┌─────────────┐    ┌────────────────┐  │
                        │  │ Firecrawl   │    │ OpenAI         │  │
                        │  │ API         │    │ GPT-4o-mini    │  │
                        │  └─────────────┘    └────────────────┘  │
                        │         │                   │           │
                        │         ▼                   ▼           │
                        │  ┌─────────────────────────────────────┐│
                        │  │ Agent 1: Person Research            ││
                        │  │ - Search for person online          ││
                        │  │ - Find social profiles              ││
                        │  │ - Identify data breaches            ││
                        │  └─────────────────────────────────────┘│
                        │                   │                     │
                        │                   ▼                     │
                        │  ┌─────────────────────────────────────┐│
                        │  │ Agent 2: Breach Analysis            ││
                        │  │ - Check companies for data breaches ││
                        │  │ - Calculate claim eligibility       ││
                        │  │ - Generate claim documents          ││
                        │  └─────────────────────────────────────┘│
                        └─────────────────────────────────────────┘
```

## Quick Start

```bash
# Terminal 1: Start backend
cd backend && npm install && npm run dev

# Terminal 2: Start frontend
cd frontend && npm install && npm run dev
```

- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:8080

## Project Structure

```
cautious-spork/
├── CLAUDE.md                 # This file
├── backend/                  # Express.js API server
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                  # API keys (Firecrawl, OpenAI)
│   └── src/
│       ├── index.ts          # Express server entry
│       ├── config.ts         # Configuration management
│       ├── services/
│       │   └── firecrawl.ts  # Firecrawl API wrapper
│       ├── agents/
│       │   ├── index.ts      # Agent exports
│       │   ├── personResearch.ts  # Agent 1: Person research
│       │   └── breachAnalysis.ts  # Agent 2: Breach analysis
│       └── routes/
│           └── api.ts        # API endpoints
└── frontend/                 # React + Vite application
    ├── CLAUDE.md             # Frontend-specific docs
    ├── package.json
    └── src/
        ├── components/       # UI components
        ├── context/          # App state (AppContext.tsx)
        ├── services/         # API client (api.ts)
        └── data/             # Mock data fallbacks
```

## Backend API

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with service status |
| `/api/discover/user` | POST | Person research (Agent 1) |
| `/api/discover/company` | POST | Company research |
| `/api/analyze` | POST | Breach analysis (Agent 2) |
| `/api/full-scan` | POST | Combined flow (all agents) |

### Request/Response Examples

**POST /api/discover/user**
```json
// Request
{ "name": "John Doe", "email": "john@example.com" }

// Response
{
  "socialProfiles": [
    { "platform": "LinkedIn", "url": "https://...", "username": "..." }
  ],
  "dataBreaches": [
    { "name": "Breach Name", "date": "2021-06-22", "dataTypes": ["Email", "Phone"] }
  ],
  "publicRecords": [
    { "type": "Property Record", "details": "..." }
  ],
  "onlinePresence": [
    { "site": "Medium", "info": "12 articles published" }
  ]
}
```

**POST /api/analyze**
```json
// Request
{ "userData": {...}, "companyData": {...}, "userName": "John Doe" }

// Response
{
  "redactoResults": [
    {
      "category": "Data Broker Listings",
      "findings": [
        { "item": "Spokeo - Full profile", "risk": "high", "action": "Opt-out drafted" }
      ]
    }
  ],
  "drafts": [
    {
      "id": "uuid",
      "type": "Data Broker Removal",
      "title": "Spokeo Opt-Out Request",
      "content": "Dear Spokeo Privacy Team...",
      "status": "pending"
    }
  ]
}
```

## Environment Variables

**backend/.env**
```
PORT=3001
FIRECRAWL_API_KEY=fc-...
OPENAI_API_KEY=sk-proj-...
```

## Tech Stack

### Backend
- **Express.js** - HTTP server
- **TypeScript** - Type safety
- **OpenAI SDK** - GPT-4o-mini for parsing/analysis
- **Firecrawl** - Web search and scraping
- **tsx** - TypeScript execution

### Frontend
- **React 18** + TypeScript
- **Vite 5.4** - Dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **shadcn/ui** - Component library

## Application Flow

```
landing → userDiscovery → [companyDiscovery] → redacto → drafts
                              (optional)
```

1. **Landing** - User enters name, email, optional company
2. **UserDiscovery** - Calls `/api/discover/user`, shows streaming terminal UI
3. **CompanyDiscovery** - (Optional) Calls `/api/discover/company`
4. **RedactoProcessing** - Calls `/api/analyze`, generates legal documents
5. **DraftsView** - Tinder-style swipe to approve/skip documents

## Graceful Degradation

The frontend gracefully handles API failures:
- Shows "Live data" indicator when backend is connected (green wifi icon)
- Shows "Offline mode" indicator when API unavailable (amber wifi icon)
- Falls back to mock data if API calls fail
- Streaming UI animations work with both real and mock data

## Legal Compliance (Non-Negotiable)

- **No legal advice** - uses "may be eligible", "potentially eligible" language
- **User-in-the-loop** - explicit approval before document dispatch
- **Deterministic rules** - eligibility thresholds are rule-based, not AI-generated
- **Auditable** - all decision paths traceable
- **California only** - single jurisdiction (CCPA/CPRA)

## Integration Status

| Service | Purpose | Status |
|---------|---------|--------|
| Firecrawl | User/company data discovery | ✅ Implemented |
| OpenAI | AI parsing and document generation | ✅ Implemented |
| Resend | Email dispatch | Not implemented |
| Auth | User accounts | Not implemented |
| Database | Persist drafts + audit logs | Not implemented |
