# Claim Compass Backend - Firecrawl Integration

Backend API for scraping LinkedIn profiles and generating personalized legal claim questions.

## Setup

```bash
cd backend-het-firecrawl
npm install
cp .env.example .env
# Add your Firecrawl API key to .env
npm run dev
```

## Get a Firecrawl API Key

1. Go to https://firecrawl.dev
2. Sign up for an account
3. Get your API key
4. Add it to `.env`:
   ```
   FIRECRAWL_API_KEY=your_key_here
   ```

## API Endpoints

### Health Check
```
GET /api/health
```

### Scrape LinkedIn Profile
```
POST /api/scrape/linkedin
Body: { "linkedinUrl": "https://linkedin.com/in/username" }

Response: {
  "success": true,
  "profile": {
    "name": "John Doe",
    "location": "California",
    "currentCompany": "Google",
    "industry": "Technology",
    "jobHistory": ["Google", "Meta"]
  }
}
```

### Generate Personalized Questions
```
POST /api/questions/generate
Body: { "profile": { ... profile from scrape ... } }

Response: {
  "success": true,
  "questions": [
    {
      "id": "california_resident",
      "question": "Have you lived in California for over 2 years?",
      "icon": "MapPin",
      "relevance": "Required for most California consumer protection claims"
    },
    ...
  ]
}
```

### Match Claims to User
```
POST /api/claims/match
Body: {
  "profile": { ... },
  "answers": {
    "california_resident": true,
    "data_breach": true,
    "spam_calls": false
  }
}

Response: {
  "success": true,
  "claims": [
    {
      "id": "1",
      "title": "Equifax Data Breach Settlement",
      "estimatedValue": "$125 - $500",
      "score": 50,
      "eligible": true
    },
    ...
  ]
}
```

## Flow

1. Frontend sends LinkedIn URL → `/api/scrape/linkedin`
2. Backend scrapes profile, extracts job history, location, industry
3. Frontend sends profile → `/api/questions/generate`
4. Backend returns personalized questions based on profile
5. User answers questions
6. Frontend sends profile + answers → `/api/claims/match`
7. Backend returns relevant claims sorted by relevance score
