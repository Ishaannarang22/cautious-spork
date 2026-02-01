import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import apiRouter from './routes/api.js';

validateConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Start server
app.listen(config.port, () => {
  console.log(`LitiGate backend running on http://localhost:${config.port}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  POST /api/discover/user');
  console.log('  POST /api/discover/company');
  console.log('  POST /api/analyze');
  console.log('  POST /api/full-scan');
});
