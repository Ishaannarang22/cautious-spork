import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import documentsRouter from './routes/documents.js';
import claimsRouter from './routes/claims.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (examples, etc.)
app.use(express.static(join(__dirname, '..')));
app.use('/examples', express.static(join(__dirname, '..', 'examples')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Claim Compass API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      reducto: !!process.env.REDUCTO_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      firecrawl: !!process.env.FIRECRAWL_API_KEY,
    },
  });
});

// Document processing routes (Reducto)
app.use('/api/documents', documentsRouter);

// Claims processing routes (SSE-enabled)
app.use('/api/claims', claimsRouter);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Reducto API: ${process.env.REDUCTO_API_KEY ? 'configured' : 'not configured'}`);
});
