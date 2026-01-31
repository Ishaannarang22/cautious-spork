const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Claim Compass API is running' });
});

// TODO: Firecrawl integration endpoint
app.post('/api/scrape/linkedin', async (req, res) => {
  const { linkedinUrl } = req.body;

  // TODO: Implement Firecrawl scraping
  // const FirecrawlApp = require('@mendable/firecrawl-js').default;
  // const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

  res.json({
    message: 'LinkedIn scraping endpoint - TODO: implement with Firecrawl',
    linkedinUrl
  });
});

// TODO: Generate personalized questions based on scraped data
app.post('/api/questions/generate', async (req, res) => {
  const { userData } = req.body;

  // TODO: Analyze userData and return personalized questions
  res.json({
    message: 'Question generation endpoint - TODO: implement',
    questions: []
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
