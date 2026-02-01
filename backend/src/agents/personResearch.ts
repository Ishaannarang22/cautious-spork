import OpenAI from 'openai';
import { config } from '../config.js';
import {
  searchPerson,
  searchDataBrokers,
  SearchResult,
} from '../services/firecrawl.js';

// Types matching frontend expectations
export interface SocialProfile {
  platform: string;
  url: string;
  username: string;
}

export interface DataBreach {
  name: string;
  date: string;
  dataTypes: string[];
}

export interface PublicRecord {
  type: string;
  details: string;
}

export interface OnlinePresence {
  site: string;
  info: string;
}

export interface DiscoveredUserData {
  socialProfiles: SocialProfile[];
  dataBreaches: DataBreach[];
  publicRecords: PublicRecord[];
  onlinePresence: OnlinePresence[];
}

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Parse search results using OpenAI to extract structured data
 */
async function parseSearchResults(
  searchResults: SearchResult[],
  userName: string
): Promise<DiscoveredUserData> {
  const prompt = `You are analyzing web search results to extract information about a person named "${userName}".

Given the following search results, extract and categorize the information into these categories:

1. Social Profiles: LinkedIn, Twitter/X, GitHub, Facebook, Instagram, etc.
2. Data Breaches: Any mentions of the person's data being exposed in breaches
3. Public Records: Property records, voter registration, professional licenses, court records
4. Online Presence: Personal websites, blogs, articles written, forum posts, professional directories

Search Results:
${JSON.stringify(searchResults, null, 2)}

Respond with ONLY valid JSON in this exact format:
{
  "socialProfiles": [
    { "platform": "LinkedIn", "url": "https://...", "username": "..." }
  ],
  "dataBreaches": [
    { "name": "Breach Name", "date": "YYYY-MM-DD", "dataTypes": ["Email", "Password"] }
  ],
  "publicRecords": [
    { "type": "Record Type", "details": "Description" }
  ],
  "onlinePresence": [
    { "site": "Site Name", "info": "Description of presence" }
  ]
}

Only include items that are clearly about the specified person. If unsure, omit the item.
Ensure dates are in YYYY-MM-DD format. If only year is known, use YYYY-01-01.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing search results with OpenAI:', error);
    // Return empty structure on error
    return {
      socialProfiles: [],
      dataBreaches: [],
      publicRecords: [],
      onlinePresence: [],
    };
  }
}

/**
 * Person Research Agent
 * Searches for a person's online presence and returns structured data
 */
export async function runPersonResearchAgent(
  name: string,
  email?: string,
  phone?: string
): Promise<DiscoveredUserData> {
  console.log(`[Person Research Agent] Starting research for: ${name}`);

  // Gather search results from multiple sources
  const [personResults, brokerResults] = await Promise.all([
    searchPerson(name, email, phone),
    searchDataBrokers(name),
  ]);

  console.log(
    `[Person Research Agent] Found ${personResults.length} person results, ${brokerResults.length} broker results`
  );

  // Combine all results
  const allResults = [...personResults, ...brokerResults];

  if (allResults.length === 0) {
    console.log('[Person Research Agent] No search results found');
    return {
      socialProfiles: [],
      dataBreaches: [],
      publicRecords: [],
      onlinePresence: [],
    };
  }

  // Use OpenAI to parse and structure the results
  const structuredData = await parseSearchResults(allResults, name);

  console.log(
    `[Person Research Agent] Extracted: ${structuredData.socialProfiles.length} profiles, ${structuredData.dataBreaches.length} breaches`
  );

  return structuredData;
}

/**
 * Generate mock/fallback data when APIs are unavailable
 */
export function generateFallbackUserData(name: string): DiscoveredUserData {
  const firstName = name.split(' ')[0];
  const lastName = name.split(' ').slice(1).join(' ') || 'User';
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}`;

  return {
    socialProfiles: [
      {
        platform: 'LinkedIn',
        url: `https://linkedin.com/in/${username}`,
        username: `${firstName} ${lastName}`,
      },
      {
        platform: 'Twitter',
        url: `https://twitter.com/${username}`,
        username: `@${username}`,
      },
      {
        platform: 'GitHub',
        url: `https://github.com/${username}`,
        username: username,
      },
    ],
    dataBreaches: [
      {
        name: 'LinkedIn 2021 Breach',
        date: '2021-06-22',
        dataTypes: ['Email', 'Phone', 'Employment History'],
      },
      {
        name: 'Adobe 2019',
        date: '2019-10-04',
        dataTypes: ['Email', 'Password Hash'],
      },
    ],
    publicRecords: [
      {
        type: 'Voter Registration',
        details: 'Registered voter in California',
      },
      {
        type: 'Property Record',
        details: 'Property ownership records found',
      },
    ],
    onlinePresence: [
      {
        site: 'Professional Directory',
        info: 'Listed in industry professional directory',
      },
      {
        site: 'Company Website',
        info: 'Featured on company team page',
      },
    ],
  };
}
