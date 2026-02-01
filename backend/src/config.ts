import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
};

export function validateConfig(): void {
  if (!config.firecrawlApiKey) {
    console.warn('Warning: FIRECRAWL_API_KEY is not set');
  }
  if (!config.openaiApiKey) {
    console.warn('Warning: OPENAI_API_KEY is not set - AI agents will not work');
  }
  if (!config.resendApiKey) {
    console.warn('Warning: RESEND_API_KEY is not set - email sending will not work');
  }
}
