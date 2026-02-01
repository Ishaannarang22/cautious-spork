import express from 'express';
import cors from 'cors';
import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firecrawl (only if API key is set)
let firecrawl = null;
if (process.env.FIRECRAWL_API_KEY) {
  firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
}

// Nyne AI config
const NYNE_API_KEY = process.env.NYNE_API_KEY;
const NYNE_API_SECRET = process.env.NYNE_API_SECRET;
const NYNE_BASE_URL = 'https://api.nyne.ai';

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Claim Compass API with SSE Streaming',
    services: {
      nyne: NYNE_API_KEY ? 'configured' : 'NOT SET',
      firecrawl: process.env.FIRECRAWL_API_KEY ? 'configured' : 'NOT SET'
    }
  });
});

// ============================================================
// MAIN ENDPOINT: SSE Stream for Discovery
// ============================================================
app.get('/api/discover-claims/stream', async (req, res) => {
  const { email, linkedinUrl, phone, name } = req.query;

  if (!email && !linkedinUrl && !phone && !name) {
    return res.status(400).json({
      error: 'At least one identifier required: email, linkedinUrl, phone, or name'
    });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Helper to send SSE events
  const sendEvent = (type, data) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected');
  });

  try {
    // Step 1: Nyne AI Enrichment
    sendEvent('step', { step: 'nyne_start', message: 'Starting Nyne AI person enrichment...' });

    let profile = createEmptyProfile(email, linkedinUrl, phone);

    if (NYNE_API_KEY && NYNE_API_SECRET) {
      try {
        sendEvent('nyne_progress', { message: 'Calling Nyne AI API...', input: { email, linkedinUrl, phone, name } });

        const nyneData = await enrichWithNyne({ email, linkedinUrl, phone, name }, sendEvent);

        if (nyneData) {
          profile = mergeNyneData(profile, nyneData);
          profile.enrichmentSources.push('nyne');

          sendEvent('nyne_complete', {
            message: 'Nyne AI enrichment complete',
            profile: {
              name: profile.name,
              email: profile.email,
              location: profile.location,
              currentCompany: profile.currentCompany,
              currentTitle: profile.currentTitle,
              headline: profile.headline,
              workHistoryCount: profile.workHistory.length,
              skillsCount: profile.skills.length,
              companies: profile.workHistory.map(w => w.company)
            }
          });
        }
      } catch (err) {
        sendEvent('nyne_error', { message: `Nyne AI error: ${err.message}` });
      }
    } else {
      sendEvent('nyne_skipped', { message: 'Nyne AI not configured - using provided data only' });
    }

    // Step 2: Get person interests (brand affinities)
    if (NYNE_API_KEY && NYNE_API_SECRET) {
      try {
        const interests = await getPersonInterests({ email, linkedinUrl, phone }, sendEvent);
        if (interests) {
          profile.brandAffinities = interests.brand_affinities || [];
          profile.psychographics = interests.psychographics || {};
          profile.interestGraph = interests.interest_graph || {};
          profile.professionalEcosystem = interests.professional_ecosystem || {};

          // Extract company names from brand affinities
          if (interests.brand_affinities) {
            const brandCompanies = [];
            for (const category of Object.values(interests.brand_affinities)) {
              if (Array.isArray(category)) {
                brandCompanies.push(...category.map(b => b.name || b));
              }
            }
            profile.mentionedCompanies = [...(profile.mentionedCompanies || []), ...brandCompanies];
          }

          sendEvent('nyne_interests_complete', {
            message: 'Person interests retrieved',
            brandAffinities: interests.brand_affinities,
            companiesFound: profile.mentionedCompanies.length
          });
        }
      } catch (err) {
        sendEvent('nyne_interests_error', { message: `Interests error: ${err.message}` });
      }
    }

    // Step 3: Firecrawl - Real-time scraping with WebSocket watcher
    if (process.env.FIRECRAWL_API_KEY) {
      sendEvent('step', { step: 'firecrawl_start', message: 'Starting Firecrawl data collection...' });

      // Scrape LinkedIn if URL provided
      if (linkedinUrl) {
        await scrapeWithFirecrawl(linkedinUrl, 'linkedin_profile', profile, sendEvent);
      }

      // Check for breach settlements based on work history
      const companies = [
        profile.currentCompany,
        ...profile.workHistory.map(w => w.company)
      ].filter(Boolean);

      const breachSettlements = {
        'Equifax': 'https://www.equifaxbreachsettlement.com',
        'T-Mobile': 'https://www.t-mobilesettlement.com',
        'Capital One': 'https://www.capitalonesettlement.com',
        'Yahoo': 'https://yahoodatabreachsettlement.com'
      };

      for (const company of companies) {
        for (const [breachCompany, settlementUrl] of Object.entries(breachSettlements)) {
          if (company.toLowerCase().includes(breachCompany.toLowerCase())) {
            await scrapeWithFirecrawl(settlementUrl, `settlement_${breachCompany}`, profile, sendEvent);
          }
        }
      }

      sendEvent('firecrawl_complete', { message: 'Firecrawl data collection complete' });
    } else {
      sendEvent('firecrawl_skipped', { message: 'Firecrawl not configured' });
    }

    // Step 4: Analyze profile
    sendEvent('step', { step: 'analysis_start', message: 'Analyzing profile for eligible claims...' });
    profile.insights = analyzeProfile(profile);
    sendEvent('analysis_complete', { message: 'Profile analysis complete', insights: profile.insights });

    // Step 5: Match claims
    sendEvent('step', { step: 'matching_start', message: 'Matching eligible claims...' });
    const claims = autoMatchClaims(profile);

    // Send each claim one by one
    for (let i = 0; i < claims.length; i++) {
      sendEvent('claim_found', {
        claimIndex: i + 1,
        totalClaims: claims.length,
        claim: claims[i]
      });
      await sleep(200);
    }

    // Final result
    const totalValue = calculateTotalValue(claims);
    sendEvent('completed', {
      message: 'Discovery complete!',
      profile: {
        name: profile.name,
        email: profile.email,
        location: profile.location,
        currentCompany: profile.currentCompany,
        workHistory: profile.workHistory
      },
      insights: profile.insights,
      claims,
      totalPotentialValue: totalValue,
      claimCount: claims.length
    });

    res.end();

  } catch (error) {
    console.error('Discovery error:', error);
    sendEvent('error', { message: `Discovery failed: ${error.message}` });
    res.end();
  }
});

// ============================================================
// Firecrawl with crawlUrlAndWatch (real-time WebSocket)
// ============================================================
async function scrapeWithFirecrawl(url, label, profile, sendEvent) {
  if (!firecrawl) {
    sendEvent('firecrawl_skipped', { label, url, message: 'Firecrawl not configured' });
    return null;
  }

  try {
    sendEvent('firecrawl_scraping', { label, url, message: `Scraping ${label}: ${url}` });

    // Use crawlUrlAndWatch for real-time updates
    const watch = await firecrawl.crawlUrlAndWatch(url, {
      limit: 5,
      scrapeOptions: { formats: ['markdown'] }
    });

    // Listen for real-time document events
    watch.on('document', (doc) => {
      sendEvent('firecrawl_document', {
        label,
        url: doc.url || url,
        message: `Scraped page: ${doc.url || url}`,
        contentLength: doc.markdown?.length || 0
      });

      // Parse and merge companies
      const parsed = parseScrapedContent(doc.markdown);
      if (parsed.companies.length > 0) {
        profile.mentionedCompanies = [
          ...(profile.mentionedCompanies || []),
          ...parsed.companies
        ];
        sendEvent('firecrawl_companies_found', {
          label,
          companies: parsed.companies
        });
      }
    });

    watch.on('error', (err) => {
      sendEvent('firecrawl_error', { label, url, message: `Error: ${err.message}` });
    });

    // Wait for completion
    const result = await watch.done();

    sendEvent('firecrawl_scraped', {
      label,
      url,
      message: `Completed ${label}`,
      pagesScraped: result.data?.length || 1
    });

    return result;

  } catch (err) {
    // Fallback to simple scrape if crawlUrlAndWatch fails
    try {
      sendEvent('firecrawl_fallback', { label, url, message: `Using simple scrape for ${label}` });

      const result = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });

      if (result.success) {
        const parsed = parseScrapedContent(result.markdown);
        if (parsed.companies.length > 0) {
          profile.mentionedCompanies = [...(profile.mentionedCompanies || []), ...parsed.companies];
        }
        sendEvent('firecrawl_scraped', { label, url, message: `Scraped ${label}`, contentLength: result.markdown?.length || 0 });
      }
      return result;
    } catch (fallbackErr) {
      sendEvent('firecrawl_error', { label, url, message: `Failed: ${fallbackErr.message}` });
      return null;
    }
  }
}

// ============================================================
// SIMPLE SCRAPE ENDPOINT (for Firecrawl teammate)
// ============================================================
app.post('/api/scrape', async (req, res) => {
  const { url, options } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const result = await firecrawl.scrapeUrl(url, options || { formats: ['markdown'] });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// CRAWL ENDPOINT WITH WATCH (for Firecrawl teammate)
// Returns SSE stream of crawl progress
// ============================================================
app.get('/api/crawl/stream', async (req, res) => {
  const { url, limit = 10 } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (type, data) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('started', { url, limit: parseInt(limit), message: 'Crawl started' });

    const watch = await firecrawl.crawlUrlAndWatch(url, {
      limit: parseInt(limit),
      scrapeOptions: { formats: ['markdown'] }
    });

    watch.on('document', (doc) => {
      sendEvent('document', {
        url: doc.url,
        title: doc.title,
        contentLength: doc.markdown?.length || 0
      });
    });

    watch.on('error', (err) => {
      sendEvent('error', { message: err.message });
    });

    const result = await watch.done();

    sendEvent('completed', {
      message: 'Crawl complete',
      totalPages: result.data?.length || 0,
      data: result.data
    });

    res.end();

  } catch (err) {
    sendEvent('error', { message: err.message });
    res.end();
  }
});

// ============================================================
// NYNE ENRICH ENDPOINT (standalone)
// ============================================================
app.post('/api/enrich', async (req, res) => {
  const { email, linkedinUrl, phone, name } = req.body;

  if (!email && !linkedinUrl && !phone && !name) {
    return res.status(400).json({ error: 'At least one identifier required' });
  }

  try {
    const data = await enrichWithNyne({ email, linkedinUrl, phone, name }, null);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// FOR FIRECRAWL TEAMMATE - Get companies to search
// ============================================================
app.post('/api/get-companies', async (req, res) => {
  const { email, linkedinUrl, phone, name } = req.body;

  if (!email && !linkedinUrl && !phone && !name) {
    return res.status(400).json({ error: 'At least one identifier required' });
  }

  try {
    // Get person enrichment from Nyne
    const nyneData = await enrichWithNyne({ email, linkedinUrl, phone, name }, null);

    let profile = createEmptyProfile(email, linkedinUrl, phone);
    if (nyneData) {
      profile = mergeNyneData(profile, nyneData);
    }

    // Determine which input helped find the person
    const matchedVia = [];
    if (email && profile.email?.toLowerCase() === email.toLowerCase()) {
      matchedVia.push('email');
    }
    if (phone && profile.phone === phone) {
      matchedVia.push('phone');
    }
    if (linkedinUrl && profile.socialProfiles?.linkedin?.toLowerCase().includes(linkedinUrl.toLowerCase().split('/in/')[1]?.split('/')[0] || '')) {
      matchedVia.push('linkedin');
    }
    // If none matched but we got data, it was found via the inputs provided
    if (matchedVia.length === 0 && profile.name) {
      if (email) matchedVia.push('email');
      if (phone) matchedVia.push('phone');
      if (linkedinUrl) matchedVia.push('linkedin');
    }

    // Extract all companies
    const companies = [
      profile.currentCompany,
      ...profile.workHistory.map(w => w.company)
    ].filter(Boolean);

    // Remove duplicates
    const uniqueCompanies = [...new Set(companies)];

    // Return clean data for Firecrawl teammate
    res.json({
      success: true,
      person: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        location: profile.location,
        state: profile.location?.split(',')[1]?.trim() || null,
        headline: profile.headline,
        matchedVia: matchedVia,
        inputsProvided: {
          email: email || null,
          phone: phone || null,
          linkedinUrl: linkedinUrl || null,
          name: name || null
        }
      },
      companies: uniqueCompanies,
      workHistory: profile.workHistory,
      skills: profile.skills,
      socialProfiles: profile.socialProfiles,
      // What Firecrawl should search for:
      searchSuggestions: {
        settlementSites: [
          'https://topclassactions.com',
          'https://classaction.org/settlements',
          'https://www.consumerfinance.gov'
        ],
        searchQueries: uniqueCompanies.map(c => `${c} class action settlement`),
        unclaimedProperty: profile.location ? `unclaimed property ${profile.location.split(',')[1]?.trim() || ''}` : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createEmptyProfile(email, linkedinUrl, phone) {
  return {
    name: null,
    email: email || null,
    phone: phone || null,
    location: null,
    currentTitle: null,
    currentCompany: null,
    industry: null,
    workHistory: [],
    education: [],
    skills: [],
    socialProfiles: { linkedin: linkedinUrl || null },
    mentionedCompanies: [],
    enrichmentSources: [],
    enrichedAt: new Date().toISOString()
  };
}

// Get person interests (brand affinities, companies they follow)
async function getPersonInterests({ email, linkedinUrl, phone }, sendEvent) {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': NYNE_API_KEY,
    'X-API-Secret': NYNE_API_SECRET
  };

  const body = {};
  if (email) body.email = email;
  if (linkedinUrl) body.social_media_url = linkedinUrl;
  if (phone) body.phone = phone;

  try {
    if (sendEvent) sendEvent('nyne_interests_start', { message: 'Fetching person interests & brand affinities...' });

    const response = await fetch(`${NYNE_BASE_URL}/person/interests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const result = await response.json();
    console.log('Nyne interests submit:', JSON.stringify(result, null, 2));

    if (!result.success) {
      if (sendEvent) sendEvent('nyne_interests_error', { message: `Interests API failed: ${result.error?.message || 'Unknown error'}` });
      return null;
    }

    if (!result.data?.request_id) {
      if (sendEvent) sendEvent('nyne_interests_error', { message: 'No request_id returned from interests API' });
      return null;
    }

    // Poll for results
    const requestId = result.data.request_id;
    const maxAttempts = 30;
    const pollInterval = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await sleep(pollInterval);

      const pollResponse = await fetch(`${NYNE_BASE_URL}/person/interests?request_id=${requestId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': NYNE_API_KEY,
          'X-API-Secret': NYNE_API_SECRET
        }
      });

      const pollResult = await pollResponse.json();
      console.log(`Nyne interests poll ${attempt + 1}:`, pollResult.data?.status);

      if (pollResult.data?.status === 'completed') {
        console.log('Nyne INTERESTS RESPONSE:', JSON.stringify(pollResult, null, 2));
        return pollResult.data?.result || pollResult.data;
      }

      if (pollResult.data?.status === 'failed') {
        return null;
      }
    }
    return null;
  } catch (err) {
    console.error('Nyne interests error:', err);
    return null;
  }
}

async function enrichWithNyne({ email, linkedinUrl, phone, name }, sendEvent) {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': NYNE_API_KEY,
    'X-API-Secret': NYNE_API_SECRET
  };

  // Send ALL identifiers together for better matching
  const body = {};
  if (email) body.email = email;
  if (linkedinUrl) body.social_media_url = linkedinUrl;
  if (phone) body.phone = phone;

  // Enable AI-enhanced search for harder to find people
  body.ai_enhanced_search = true;

  // Get social media posts/activity
  body.newsfeed = ['linkedin', 'twitter'];

  console.log('Nyne request:', { url: `${NYNE_BASE_URL}/person/enrichment`, body });

  // Step 1: Submit enrichment request
  const response = await fetch(`${NYNE_BASE_URL}/person/enrichment`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const result = await response.json();
  console.log('Nyne submit response:', response.status, result);

  if (!response.ok && response.status !== 202) {
    throw new Error(`Nyne API: ${response.status} - ${JSON.stringify(result)}`);
  }

  // Check if completed immediately
  if (result.data?.status === 'completed') {
    return result;
  }

  // Step 2: Poll for results using request_id
  const requestId = result.data?.request_id;
  if (!requestId) {
    throw new Error('No request_id returned from Nyne');
  }

  if (sendEvent) {
    sendEvent('nyne_polling', { message: `Polling for results (request_id: ${requestId.slice(0, 20)}...)` });
  }

  // Poll with backoff - increased timeout for harder to find people
  const maxAttempts = 60; // 60 attempts
  const pollInterval = 3000; // 3 seconds = 3 minutes max

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(pollInterval);

    const pollResponse = await fetch(`${NYNE_BASE_URL}/person/enrichment?request_id=${requestId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': NYNE_API_KEY,
        'X-API-Secret': NYNE_API_SECRET
      }
    });

    const pollResult = await pollResponse.json();
    console.log(`Nyne poll attempt ${attempt + 1}:`, pollResult.data?.status || pollResult);

    if (pollResult.data?.status === 'completed') {
      console.log('Nyne FULL RESPONSE:', JSON.stringify(pollResult, null, 2));
      return pollResult;
    }

    if (pollResult.data?.status === 'failed') {
      throw new Error(`Nyne enrichment failed: ${pollResult.data?.error || 'Unknown error'}`);
    }

    // Still processing - continue polling
    if (sendEvent && attempt % 3 === 0) {
      sendEvent('nyne_polling', { message: `Still processing... (attempt ${attempt + 1})` });
    }
  }

  throw new Error('Nyne enrichment timed out');
}

function mergeNyneData(profile, nyneData) {
  // Nyne returns data in nyneData.data.result
  const result = nyneData.data?.result || nyneData.result || nyneData;

  // Name
  profile.name = result.displayname || result.full_name ||
    (result.firstname && result.lastname ? `${result.firstname} ${result.lastname}` : null) ||
    profile.name;

  // Email
  profile.email = result.best_personal_email || result.email || profile.email;

  // Location
  if (result.address) {
    profile.location = `${result.address.city || ''}, ${result.address.state || ''}, ${result.address.country || ''}`.replace(/^, |, $/g, '');
  } else if (result.location) {
    profile.location = result.location;
  }

  // Current job (first organization that's current)
  const currentJob = result.organizations?.find(org =>
    org.endDate === 'Present' || org.endDate_formatted?.is_current
  ) || result.organizations?.[0];

  if (currentJob) {
    profile.currentCompany = currentJob.name || profile.currentCompany;
    profile.currentTitle = currentJob.title || profile.currentTitle;
  }

  // Work history
  if (result.organizations?.length > 0) {
    profile.workHistory = result.organizations.map(org => ({
      company: org.name,
      title: org.title,
      startDate: org.startDate,
      endDate: org.endDate,
      logoUrl: org.logo_url,
      linkedinUrl: org.company_linkedin_url
    }));
  }

  // Education
  if (result.schools_info?.length > 0) {
    profile.education = result.schools_info.map(school => ({
      name: school.name,
      degree: school.title,
      field: school.degree,
      logoUrl: school.logo_url
    }));
  }

  // Skills
  if (result.interests?.skills?.length > 0) {
    profile.skills = result.interests.skills;
  }

  // Social profiles
  if (result.social_profiles) {
    profile.socialProfiles = {
      linkedin: result.social_profiles.linkedin?.url || profile.socialProfiles?.linkedin,
      linkedinPhoto: result.social_profiles.linkedin?.photo_url,
      linkedinFollowers: result.social_profiles.linkedin?.followers
    };
  }

  // Bio/Summary
  profile.bio = result.summary || result.bio;
  profile.headline = result.headline;

  return profile;
}

function parseScrapedContent(content) {
  if (!content) return { companies: [], rawContent: '' };

  const targetCompanies = [
    'Google', 'Meta', 'Facebook', 'Apple', 'Amazon', 'Microsoft', 'Netflix',
    'T-Mobile', 'AT&T', 'Verizon', 'Equifax', 'Capital One', 'Wells Fargo',
    'Bank of America', 'Chase', 'JPMorgan', 'Target', 'Walmart', 'Home Depot',
    'Marriott', 'Yahoo', 'LinkedIn', 'Twitter', 'Uber', 'Lyft', 'Airbnb'
  ];

  return {
    companies: targetCompanies.filter(c => content.toLowerCase().includes(c.toLowerCase())),
    rawContent: content
  };
}

function analyzeProfile(profile) {
  const insights = {
    californiaResident: false,
    techIndustry: false,
    financeIndustry: false,
    healthcareIndustry: false,
    breachedCompanyExposure: [],
    eligibleCategories: [],
    riskScore: 0
  };

  const locationLower = (profile.location || '').toLowerCase();
  const caIndicators = ['california', 'san francisco', 'los angeles', 'san diego', 'san jose', 'bay area'];
  insights.californiaResident = caIndicators.some(ind => locationLower.includes(ind));

  const allText = [profile.currentTitle, profile.industry, ...profile.skills].filter(Boolean).join(' ').toLowerCase();

  if (/software|engineer|developer|tech|data/.test(allText)) {
    insights.techIndustry = true;
  }
  if (/bank|finance|investment/.test(allText)) {
    insights.financeIndustry = true;
  }
  if (/health|medical|hospital/.test(allText)) {
    insights.healthcareIndustry = true;
  }

  const breachedCompanies = {
    'Equifax': { year: '2017', affected: '147 million', payout: '$125-500' },
    'T-Mobile': { year: '2021', affected: '76 million', payout: '$25-100' },
    'Capital One': { year: '2019', affected: '100 million', payout: '$25-75' },
    'Yahoo': { year: '2013-2016', affected: '3 billion', payout: '$100-350' },
    'Facebook': { year: '2018-2019', affected: '533 million', payout: '$50-200' },
    'Meta': { year: '2018-2019', affected: '533 million', payout: '$50-200' },
    'LinkedIn': { year: '2021', affected: '700 million', payout: '$50-150' },
    'Twitter': { year: '2022', affected: '200 million', payout: '$25-100' },
    'X': { year: '2022', affected: '200 million', payout: '$25-100' },
    'Apple': { year: '2023', affected: 'iOS users', payout: '$25-75' },
    'Google': { year: '2023', affected: 'Privacy violations', payout: '$50-100' },
    'Amazon': { year: '2023', affected: 'Ring/Alexa users', payout: '$25-50' },
    'Uber': { year: '2022', affected: '57 million', payout: '$50-100' },
    'Marriott': { year: '2018', affected: '500 million', payout: '$25-75' },
    'Home Depot': { year: '2014', affected: '56 million', payout: '$25-50' },
    'Target': { year: '2013', affected: '110 million', payout: '$25-50' },
    'AT&T': { year: '2024', affected: '73 million', payout: '$50-150' },
    'Verizon': { year: '2022', affected: 'Prepaid customers', payout: '$25-75' },
    'Tesla': { year: '2023', affected: 'Employee data', payout: '$25-50' }
  };

  // Collect all companies from work history, mentions, and brand affinities
  const allCompanies = [
    profile.currentCompany,
    ...profile.workHistory.map(w => w.company),
    ...(profile.mentionedCompanies || [])
  ].filter(Boolean);

  // Also extract brands from brand affinities
  if (profile.brandAffinities) {
    for (const [category, brands] of Object.entries(profile.brandAffinities)) {
      if (Array.isArray(brands)) {
        for (const brand of brands) {
          const brandName = typeof brand === 'string' ? brand : brand.name;
          if (brandName) allCompanies.push(brandName);
        }
      }
    }
  }

  for (const company of allCompanies) {
    for (const [breachedName, info] of Object.entries(breachedCompanies)) {
      if (company.toLowerCase().includes(breachedName.toLowerCase())) {
        insights.breachedCompanyExposure.push({ company: breachedName, ...info });
        insights.riskScore += 20;
      }
    }
  }

  if (insights.californiaResident) insights.riskScore += 15;

  return insights;
}

function autoMatchClaims(profile) {
  const insights = profile.insights;
  const claims = [];

  for (const breach of insights.breachedCompanyExposure) {
    claims.push({
      id: `breach_${breach.company.toLowerCase()}`,
      type: 'data_breach',
      title: `${breach.company} Data Breach Settlement`,
      description: `The ${breach.year} breach affected ${breach.affected} people.`,
      estimatedValue: breach.payout,
      matchReason: `Your profile shows connection to ${breach.company}`,
      confidence: 'high',
      urgency: 'high'
    });
  }

  if (insights.californiaResident) {
    claims.push({
      id: 'ca_unclaimed',
      type: 'unclaimed_property',
      title: 'California Unclaimed Property',
      description: 'California may hold unclaimed money in your name.',
      estimatedValue: '$100 - $1,000+',
      matchReason: 'California resident',
      confidence: 'medium',
      urgency: 'low'
    });
  }

  claims.push({
    id: 'tcpa_robocalls',
    type: 'robocall',
    title: 'TCPA Robocall Violations',
    description: 'Each illegal robocall can be worth $500-$1,500.',
    estimatedValue: '$500 - $1,500',
    matchReason: 'Most Americans receive illegal robocalls',
    confidence: 'medium',
    urgency: 'medium'
  });

  return claims;
}

function calculateTotalValue(claims) {
  let min = 0, max = 0;
  for (const claim of claims) {
    const match = claim.estimatedValue.match(/\$?([\d,]+)\s*-?\s*\$?([\d,]+)?/);
    if (match) {
      min += parseInt(match[1].replace(/,/g, '')) || 0;
      max += parseInt(match[2]?.replace(/,/g, '') || match[1].replace(/,/g, '')) || 0;
    }
  }
  return { min, max, formatted: `$${min.toLocaleString()} - $${max.toLocaleString()}` };
}

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`
🚀 Claim Compass API

📡 Base URL: http://localhost:${PORT}

📋 ENDPOINTS FOR TEAMMATES:

┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND TEAMMATE                                               │
├─────────────────────────────────────────────────────────────────┤
│ GET /api/discover-claims/stream                                 │
│     ?email=user@example.com                                     │
│     &linkedinUrl=https://linkedin.com/in/username               │
│     &name=John%20Doe                                            │
│                                                                 │
│ Returns: SSE stream with real-time discovery updates            │
│ Events: step, nyne_*, firecrawl_*, claim_found, completed       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FIRECRAWL TEAMMATE                                              │
├─────────────────────────────────────────────────────────────────┤
│ GET  /api/crawl/stream?url=https://example.com&limit=10         │
│      Returns: SSE stream of crawl progress                      │
│                                                                 │
│ POST /api/scrape                                                │
│      Body: { "url": "https://example.com" }                     │
│      Returns: { success, data }                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NYNE TEAMMATE                                                   │
├─────────────────────────────────────────────────────────────────┤
│ POST /api/enrich                                                │
│      Body: { "email": "...", "linkedinUrl": "...", "name": "..."}│
│      Returns: { success, data }                                 │
└─────────────────────────────────────────────────────────────────┘

│ GET  /api/health - Health check                                 │

🔑 API Keys: Nyne ${NYNE_API_KEY ? '✓' : '✗'} | Firecrawl ${process.env.FIRECRAWL_API_KEY ? '✓' : '✗'}
  `);
});
