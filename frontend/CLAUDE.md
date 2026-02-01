# LitiGate Frontend

Automated consumer rights enforcement system for California. Identifies potential statutory compensation eligibility and generates compliant legal documents.

## Project Purpose

LitiGate automates the enforcement of existing consumer rights through compliant procedural workflows:
- Collects user-provided factual information
- Identifies potential statutory/regulatory compensation eligibility
- Generates compliant pre-action and complaint documents
- Routes documents to the correct counterparty with user approval

**Target market:** Law firms that lack resources to tackle small consumer disputes. Consumer-facing with potential B2B applications.

## Tech Stack

- **React 18** + TypeScript
- **Vite 5.4** - dev server on port 8080
- **Tailwind CSS** - minimal light theme
- **Framer Motion** - page transitions and animations
- **shadcn/ui** - base components
- **Lucide React** - icons

## Commands

```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Production build
npm run preview  # Preview production build
```

## Design System

Minimal light theme inspired by legora.com.

### Colors (`src/index.css`)
| Token | Value | Use |
|-------|-------|-----|
| Background | `hsl(60 9% 98%)` #fbfbf9 | Page background |
| Foreground | `hsl(0 0% 4%)` #0a0a0a | Text, primary buttons |
| Primary | `hsl(78 78% 75%)` #d0f289 | Lime green accents |
| Accent | `hsl(25 80% 59%)` #e68846 | Warm highlights |

### Typography
- **Sans:** Inter (Google Fonts)
- **Mono:** JetBrains Mono (terminal displays)
- Letter-spacing: -0.01em

### Components
- **Cards:** `bg-white border border-border rounded-2xl`
- **Buttons:** `rounded-full` pill shape, black primary
- **Terminal:** Dark `#1c1c1c` container for streaming logs
- **Badges:** Colored backgrounds with matching borders (red/amber/emerald)

## Application Flow

```
landing → userDiscovery → [companyDiscovery] → redacto → drafts
                              (optional)
```

| Step | Component | Description |
|------|-----------|-------------|
| 1 | `LandingPage.tsx` | Hero, stats, intake form (name, email, company) |
| 2 | `UserDiscovery.tsx` | Firecrawl simulation - finds social profiles, breaches, records |
| 3 | `CompanyDiscovery.tsx` | Company analysis (only if company provided) |
| 4 | `RedactoProcessing.tsx` | Eligibility analysis, generates document drafts |
| 5 | `DraftsView.tsx` | Tinder-style swipe interface for document approval |

### DraftsView Swipe Interface
- **Card stack** - Stacked cards with depth effect (scale + translate)
- **Swipe gestures** - Drag left to skip, right to send (100px threshold)
- **Action buttons** - Red X to skip, black Send button to approve
- **Visual feedback** - "SKIP"/"SEND" labels appear on swipe direction
- **Fly-off animation** - Cards rotate and exit screen when dismissed
- **Expandable content** - Toggle to view full document with legal footer
- **Completion screen** - Summary stats when all documents reviewed

## Key Files

```
src/
├── components/
│   ├── LandingPage.tsx      # Hero + intake form
│   ├── UserDiscovery.tsx    # User data scan (calls backend API)
│   ├── CompanyDiscovery.tsx # Company scan (calls backend API)
│   ├── RedactoProcessing.tsx # Analysis + draft generation (calls backend API)
│   ├── DraftsView.tsx       # Tinder-style swipe to send/skip documents
│   └── DiscoveryGraph.tsx   # Interactive 4-column flow visualization
├── context/
│   └── AppContext.tsx       # State machine + types
├── services/
│   └── api.ts               # Backend API client
├── data/
│   └── mockData.ts          # Mock discovery data + streaming steps (fallback)
├── pages/
│   └── Index.tsx            # Router with AnimatePresence
└── index.css                # Tailwind + CSS variables
```

## State Types

```typescript
type AppState = 'landing' | 'userDiscovery' | 'companyDiscovery' | 'redacto' | 'drafts';

interface UserInfo { name: string; email: string; company?: string; }
interface DiscoveredUserData { socialProfiles, dataBreaches, publicRecords, onlinePresence }
interface DiscoveredCompanyData { companyInfo, employees, newsArticles, legalFilings }
interface RedactoResult { category: string; findings: { item, risk, action }[] }
interface DraftItem { id, type, title, content, status: 'pending' | 'sent' | 'deleted' }
```

## Legal Compliance (Non-Negotiable)

- **No legal advice** - uses "may be eligible", "potentially eligible" language
- **User-in-the-loop** - explicit approval before document dispatch
- **Deterministic rules** - eligibility thresholds are rule-based, not AI-generated
- **Auditable** - all decision paths traceable
- **California only** - single jurisdiction, no cross-jurisdiction inference

## Backend Integration

The frontend connects to the Express backend at `http://localhost:3001/api`.

### API Client

Located at `src/services/api.ts`:
- `api.discoverUser(name, email)` - Person research
- `api.discoverCompany(company, name)` - Company research
- `api.analyze(userData, companyData, userName)` - Breach analysis
- `api.fullScan(name, email, phone, company)` - Combined flow

### Graceful Degradation

Components handle API failures gracefully:
- Show "Live data" indicator when backend connected (green wifi icon)
- Show "Offline mode" indicator when API unavailable (amber wifi icon)
- Fall back to mock data from `src/data/mockData.ts` if API fails
- Streaming UI animations work with both real and mock data

### Modified Components

| Component | Changes |
|-----------|---------|
| `UserDiscovery.tsx` | Calls `/api/discover/user`, generates steps from API response |
| `CompanyDiscovery.tsx` | Calls `/api/discover/company`, generates steps from API response |
| `RedactoProcessing.tsx` | Calls `/api/analyze`, generates steps from API response |

## Integration Status

| Service | Purpose | Status |
|---------|---------|--------|
| Firecrawl | User/company data discovery | ✅ Implemented (via backend) |
| OpenAI | AI parsing + document generation | ✅ Implemented (via backend) |
| Resend | Email dispatch | Not implemented |
| Auth | User accounts | Not implemented |
| Database | Persist drafts + audit logs | Not implemented |
