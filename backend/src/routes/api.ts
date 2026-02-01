import { Router, Request, Response } from 'express';
import {
  runPersonResearchAgent,
  generateFallbackUserData,
  runBreachAnalysisAgent,
  generateFallbackAnalysis,
  DiscoveredUserData,
  DiscoveredCompanyData,
} from '../agents/index.js';
import { searchCompanyInfo, SearchResult } from '../services/firecrawl.js';
import { sendDraftEmail } from '../services/email.js';
import OpenAI from 'openai';
import { config } from '../config.js';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      firecrawl: !!config.firecrawlApiKey,
      openai: !!config.openaiApiKey,
      resend: !!config.resendApiKey,
    },
  });
});

// User Discovery Endpoint
router.post('/discover/user', async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    console.log(`[API] Starting user discovery for: ${name}`);

    let userData: DiscoveredUserData;

    // Check if APIs are configured
    if (config.firecrawlApiKey && config.openaiApiKey) {
      try {
        userData = await runPersonResearchAgent(name, email, phone);
      } catch (error) {
        console.error('[API] Agent error, falling back to mock data:', error);
        userData = generateFallbackUserData(name);
      }
    } else {
      console.log('[API] APIs not configured, using fallback data');
      userData = generateFallbackUserData(name);
    }

    res.json(userData);
  } catch (error) {
    console.error('[API] User discovery error:', error);
    res.status(500).json({
      error: 'Failed to discover user data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Company Discovery Endpoint
router.post('/discover/company', async (req: Request, res: Response) => {
  try {
    const { company, name } = req.body;

    if (!company) {
      res.status(400).json({ error: 'Company name is required' });
      return;
    }

    console.log(`[API] Starting company discovery for: ${company}`);

    let companyData: DiscoveredCompanyData;

    if (config.firecrawlApiKey && config.openaiApiKey) {
      try {
        const searchResults = await searchCompanyInfo(company);
        companyData = await parseCompanyResults(searchResults, company);
      } catch (error) {
        console.error('[API] Company research error, falling back:', error);
        companyData = generateFallbackCompanyData(company);
      }
    } else {
      companyData = generateFallbackCompanyData(company);
    }

    res.json(companyData);
  } catch (error) {
    console.error('[API] Company discovery error:', error);
    res.status(500).json({
      error: 'Failed to discover company data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Analysis Endpoint
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { userData, companyData, userName } = req.body;

    if (!userData) {
      res.status(400).json({ error: 'userData is required' });
      return;
    }

    console.log('[API] Starting breach analysis');

    let analysisResult;

    if (config.firecrawlApiKey && config.openaiApiKey) {
      try {
        analysisResult = await runBreachAnalysisAgent(
          userData,
          companyData,
          userName
        );
      } catch (error) {
        console.error('[API] Analysis error, falling back:', error);
        analysisResult = generateFallbackAnalysis(userData);
      }
    } else {
      analysisResult = generateFallbackAnalysis(userData);
    }

    res.json(analysisResult);
  } catch (error) {
    console.error('[API] Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Full Scan Endpoint (Combined flow)
router.post('/full-scan', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, company } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    console.log(`[API] Starting full scan for: ${name}`);

    // Step 1: User Discovery
    let userData: DiscoveredUserData;
    if (config.firecrawlApiKey && config.openaiApiKey) {
      try {
        userData = await runPersonResearchAgent(name, email, phone);
      } catch (error) {
        console.error('[API] User research failed, using fallback:', error);
        userData = generateFallbackUserData(name);
      }
    } else {
      userData = generateFallbackUserData(name);
    }

    // Step 2: Company Discovery (if provided)
    let companyData: DiscoveredCompanyData | undefined;
    if (company) {
      if (config.firecrawlApiKey && config.openaiApiKey) {
        try {
          const searchResults = await searchCompanyInfo(company);
          companyData = await parseCompanyResults(searchResults, company);
        } catch (error) {
          console.error('[API] Company research failed, using fallback:', error);
          companyData = generateFallbackCompanyData(company);
        }
      } else {
        companyData = generateFallbackCompanyData(company);
      }
    }

    // Step 3: Breach Analysis
    let analysisResult;
    if (config.firecrawlApiKey && config.openaiApiKey) {
      try {
        analysisResult = await runBreachAnalysisAgent(userData, companyData, name);
      } catch (error) {
        console.error('[API] Analysis failed, using fallback:', error);
        analysisResult = generateFallbackAnalysis(userData);
      }
    } else {
      analysisResult = generateFallbackAnalysis(userData);
    }

    res.json({
      userData,
      companyData,
      ...analysisResult,
    });
  } catch (error) {
    console.error('[API] Full scan error:', error);
    res.status(500).json({
      error: 'Failed to complete full scan',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper function to parse company search results with OpenAI
async function parseCompanyResults(
  searchResults: SearchResult[],
  companyName: string
): Promise<DiscoveredCompanyData> {
  const openai = new OpenAI({ apiKey: config.openaiApiKey });

  const prompt = `Analyze the following search results about the company "${companyName}" and extract structured information.

Search Results:
${JSON.stringify(searchResults, null, 2)}

Respond with ONLY valid JSON:
{
  "companyInfo": [
    { "field": "Founded", "value": "year or date" },
    { "field": "Industry", "value": "..." },
    { "field": "Headquarters", "value": "..." },
    { "field": "Size", "value": "..." }
  ],
  "employees": [
    { "name": "Name", "role": "Title" }
  ],
  "newsArticles": [
    { "title": "...", "source": "...", "date": "YYYY-MM-DD" }
  ],
  "legalFilings": [
    { "type": "Patent|Trademark|SEC Filing", "date": "YYYY-MM-DD", "status": "..." }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing company results:', error);
    return generateFallbackCompanyData(companyName);
  }
}

// Send Draft Email Endpoint
router.post('/send-draft', async (req: Request, res: Response) => {
  try {
    const { draft, recipientEmail, userName, userEmail } = req.body;

    if (!draft || !recipientEmail || !userName || !userEmail) {
      res.status(400).json({
        error: 'Missing required fields: draft, recipientEmail, userName, userEmail',
      });
      return;
    }

    console.log(`[API] Sending draft "${draft.title}" to ${recipientEmail}`);

    const result = await sendDraftEmail({
      to: recipientEmail,
      subject: `${draft.type}: ${draft.title}`,
      content: draft.content,
      userName,
      userEmail,
      draftType: draft.type,
    });

    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send email',
      });
    }
  } catch (error) {
    console.error('[API] Send draft error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper function to generate fallback company data
function generateFallbackCompanyData(companyName: string): DiscoveredCompanyData {
  return {
    companyInfo: [
      { field: 'Company Name', value: companyName },
      { field: 'Industry', value: 'Technology' },
      { field: 'Size', value: '100-500 employees' },
      { field: 'Location', value: 'California, USA' },
    ],
    employees: [
      { name: 'John Smith', role: 'CEO' },
      { name: 'Jane Doe', role: 'CTO' },
      { name: 'Bob Johnson', role: 'CFO' },
    ],
    newsArticles: [
      {
        title: `${companyName} Announces New Product Launch`,
        source: 'TechCrunch',
        date: new Date().toISOString().split('T')[0],
      },
    ],
    legalFilings: [
      {
        type: 'Trademark',
        date: new Date().toISOString().split('T')[0],
        status: 'Registered',
      },
    ],
  };
}

export default router;
