import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { searchCompanyBreaches, SearchResult } from '../services/firecrawl.js';
import { DiscoveredUserData } from './personResearch.js';

// Types matching frontend expectations
export interface RedactoFinding {
  item: string;
  risk: 'high' | 'medium' | 'low';
  action: string;
}

export interface RedactoResult {
  category: string;
  findings: RedactoFinding[];
}

export interface DraftItem {
  id: string;
  type: string;
  title: string;
  content: string;
  status: 'pending' | 'sent' | 'deleted';
}

export interface DiscoveredCompanyData {
  companyInfo: { field: string; value: string }[];
  employees: { name: string; role: string }[];
  newsArticles: { title: string; source: string; date: string }[];
  legalFilings: { type: string; date: string; status: string }[];
}

export interface AnalysisResult {
  redactoResults: RedactoResult[];
  drafts: DraftItem[];
}

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Analyze breach data and determine eligibility using OpenAI
 */
async function analyzeBreachesWithOpenAI(
  userData: DiscoveredUserData,
  breachSearchResults: SearchResult[],
  userName: string
): Promise<{ results: RedactoResult[]; drafts: DraftItem[] }> {
  const prompt = `You are a legal analysis assistant helping determine data privacy claim eligibility under California law (CCPA/CPRA).

Analyze the following information about ${userName}:

User Data Found:
${JSON.stringify(userData, null, 2)}

Additional Breach Search Results:
${JSON.stringify(breachSearchResults, null, 2)}

Based on this information, provide:

1. Analysis Results - categorized findings with risk levels
2. Draft documents - legal letters/requests the user may be eligible to send

Categories to analyze:
- Data Broker Listings (sites like Spokeo, Whitepages that have user's info)
- Privacy Violations (potential CCPA violations)
- Breach Notifications (data breaches affecting the user)
- Marketing Lists (unwanted marketing/spam exposure)

For each finding, include:
- item: Brief description of what was found
- risk: "high", "medium", or "low" based on California law
- action: What document/request can address this

Draft types to generate:
- "Data Broker Removal" - Opt-out requests to data brokers
- "Legal Claim" - CCPA violation claims
- "Privacy Request" - Data deletion requests
- "Breach Notification" - Responses to breach notifications

IMPORTANT:
- Only mark as "high" risk if there's clear evidence of CCPA violation or significant data exposure
- Be specific about which California laws apply
- Include proper legal language in drafts

Respond with ONLY valid JSON:
{
  "results": [
    {
      "category": "Category Name",
      "findings": [
        { "item": "Description", "risk": "high", "action": "Action to take" }
      ]
    }
  ],
  "drafts": [
    {
      "id": "unique-id",
      "type": "Data Broker Removal",
      "title": "Document Title",
      "content": "Full document text with proper legal language...",
      "status": "pending"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);

    // Ensure all drafts have proper IDs
    parsed.drafts = parsed.drafts.map((draft: DraftItem) => ({
      ...draft,
      id: draft.id || uuidv4(),
      status: 'pending',
    }));

    return parsed;
  } catch (error) {
    console.error('Error analyzing with OpenAI:', error);
    throw error;
  }
}

/**
 * Breach Analysis Agent
 * Analyzes discovered data for privacy violations and generates claim documents
 */
export async function runBreachAnalysisAgent(
  userData: DiscoveredUserData,
  companyData?: DiscoveredCompanyData,
  userName?: string
): Promise<AnalysisResult> {
  console.log('[Breach Analysis Agent] Starting analysis');

  // Extract company names from user's data for breach search
  const companyNames: string[] = [];

  // Extract from breaches
  userData.dataBreaches.forEach((breach) => {
    const companyName = breach.name.replace(/\d{4}.*$/, '').trim();
    if (companyName && !companyNames.includes(companyName)) {
      companyNames.push(companyName);
    }
  });

  console.log(`[Breach Analysis Agent] Searching breaches for: ${companyNames.join(', ')}`);

  // Search for additional breach information
  const breachSearchPromises = companyNames.map((company) =>
    searchCompanyBreaches(company)
  );
  const breachResults = await Promise.all(breachSearchPromises);
  const allBreachResults = breachResults.flat();

  console.log(
    `[Breach Analysis Agent] Found ${allBreachResults.length} additional breach results`
  );

  // Use OpenAI to analyze and generate documents
  const analysis = await analyzeBreachesWithOpenAI(
    userData,
    allBreachResults,
    userName || 'the user'
  );

  console.log(
    `[Breach Analysis Agent] Generated ${analysis.results.length} result categories, ${analysis.drafts.length} drafts`
  );

  return {
    redactoResults: analysis.results,
    drafts: analysis.drafts,
  };
}

/**
 * Generate fallback analysis when APIs are unavailable
 */
export function generateFallbackAnalysis(
  userData: DiscoveredUserData
): AnalysisResult {
  const results: RedactoResult[] = [
    {
      category: 'Data Broker Listings',
      findings: [
        {
          item: 'Spokeo - Full profile with address history',
          risk: 'high',
          action: 'Opt-out request drafted',
        },
        {
          item: 'Whitepages - Phone and address listed',
          risk: 'high',
          action: 'Removal request drafted',
        },
        {
          item: 'BeenVerified - Background check data',
          risk: 'medium',
          action: 'Data deletion request drafted',
        },
      ],
    },
    {
      category: 'Privacy Violations',
      findings: userData.dataBreaches.map((breach) => ({
        item: `${breach.name} - Exposed: ${breach.dataTypes.join(', ')}`,
        risk: 'high' as const,
        action: 'CCPA claim drafted',
      })),
    },
    {
      category: 'Marketing Lists',
      findings: [
        {
          item: 'Email found on marketing databases',
          risk: 'medium',
          action: 'Unsubscribe request drafted',
        },
        {
          item: 'Phone number on telemarketing lists',
          risk: 'low',
          action: 'Do Not Call request drafted',
        },
      ],
    },
  ];

  const drafts: DraftItem[] = [
    {
      id: uuidv4(),
      type: 'Data Broker Removal',
      title: 'Spokeo Opt-Out Request',
      content: `Dear Spokeo Privacy Team,

Pursuant to the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.100 et seq., I am exercising my right to request the deletion of my personal information from your database.

Please remove all personal information associated with my name and contact details from your website and any associated databases.

I request written confirmation of this deletion within 45 days as required by law.

Sincerely,
[Your Name]`,
      status: 'pending',
    },
    {
      id: uuidv4(),
      type: 'Data Broker Removal',
      title: 'Whitepages Removal Request',
      content: `Dear Whitepages Privacy Team,

Under the California Consumer Privacy Act (CCPA), I am requesting the complete deletion of my personal information from your platform.

This includes but is not limited to: name, address, phone number, email, and any associated records.

Please confirm deletion within the legally required 45-day period.

Sincerely,
[Your Name]`,
      status: 'pending',
    },
    {
      id: uuidv4(),
      type: 'Legal Claim',
      title: 'Data Breach Notification Response',
      content: `Dear Legal Department,

I am writing regarding the data breach that affected my personal information.

Under California Civil Code § 1798.82, I request detailed information about:
1. The specific personal data that was compromised
2. The timeline of the breach discovery and notification
3. Steps taken to mitigate harm
4. Available remediation options

Additionally, I may be eligible for compensation under applicable data breach settlement programs.

Please respond within 30 days.

Sincerely,
[Your Name]`,
      status: 'pending',
    },
    {
      id: uuidv4(),
      type: 'Privacy Request',
      title: 'CCPA Data Deletion Request',
      content: `Dear Privacy Officer,

Pursuant to the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.105, I hereby request the deletion of all personal information your company has collected about me.

This request covers all categories of personal information as defined in § 1798.140(o), including but not limited to:
- Identifiers (name, email, phone)
- Internet activity
- Geolocation data
- Professional information

Please confirm receipt and complete this request within 45 days as required by law.

Sincerely,
[Your Name]`,
      status: 'pending',
    },
  ];

  return { redactoResults: results, drafts };
}
