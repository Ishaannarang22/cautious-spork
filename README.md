# Claim Compass

Legal claims discovery platform - Find money you're owed.

## Project Structure

```
├── frontend/               # React + Vite frontend
├── backend-het-firecrawl/  # Node.js backend with Firecrawl integration
└── README.md
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:8080
```

### Backend

```bash
cd backend-het-firecrawl
npm install
cp .env.example .env   # Add your Firecrawl API key
npm run dev
# Runs at http://localhost:3001
```

## Team Setup

1. Clone the repo
2. Run frontend and backend as shown above
3. Get a Firecrawl API key from https://firecrawl.dev

## API Endpoints (Backend)

- `GET /api/health` - Health check
- `POST /api/scrape/linkedin` - Scrape LinkedIn profile (TODO)
- `POST /api/questions/generate` - Generate personalized questions (TODO)

## Flow

```
User enters email/LinkedIn
    → Firecrawl scrapes data
    → Generate personalized questions
    → Show relevant claims
```

## Tech Stack

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Backend:**
- Node.js
- Express
- Firecrawl API
