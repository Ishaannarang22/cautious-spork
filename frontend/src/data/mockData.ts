import { DiscoveredUserData, DiscoveredCompanyData, RedactoResult, DraftItem } from '@/context/AppContext';

export const mockUserData: DiscoveredUserData = {
  socialProfiles: [
    { platform: 'LinkedIn', url: 'linkedin.com/in/johndoe', username: 'johndoe' },
    { platform: 'Twitter', url: 'twitter.com/johndoe', username: '@johndoe' },
    { platform: 'GitHub', url: 'github.com/johndoe', username: 'johndoe' },
    { platform: 'Facebook', url: 'facebook.com/john.doe', username: 'john.doe' },
  ],
  dataBreaches: [
    { name: 'LinkedIn 2021', date: '2021-06-22', dataTypes: ['Email', 'Phone', 'Employment'] },
    { name: 'Adobe 2019', date: '2019-10-15', dataTypes: ['Email', 'Password Hash', 'Username'] },
    { name: 'Equifax 2017', date: '2017-09-07', dataTypes: ['SSN', 'DOB', 'Address', 'Credit Score'] },
    { name: 'Yahoo 2016', date: '2016-12-14', dataTypes: ['Email', 'Password', 'Security Questions'] },
  ],
  publicRecords: [
    { type: 'Property Record', details: '123 Main St, San Francisco, CA - Purchased 2019' },
    { type: 'Voter Registration', details: 'Registered in San Francisco County, CA' },
    { type: 'Professional License', details: 'CA Real Estate License #01234567' },
  ],
  onlinePresence: [
    { site: 'Company Website', info: 'Listed as Senior Engineer at Acme Corp' },
    { site: 'Medium', info: '12 articles published on technology topics' },
    { site: 'Stack Overflow', info: '15.2k reputation, top 5% contributor' },
    { site: 'Personal Blog', info: 'johndoe.dev - Active since 2018' },
  ],
};

export const mockCompanyData: DiscoveredCompanyData = {
  companyInfo: [
    { field: 'Legal Name', value: 'Acme Corporation Inc.' },
    { field: 'Founded', value: '2015' },
    { field: 'Headquarters', value: 'San Francisco, CA' },
    { field: 'Industry', value: 'Technology / SaaS' },
    { field: 'Employees', value: '150-200' },
    { field: 'Revenue', value: '$25M - $50M (Est.)' },
    { field: 'Funding', value: 'Series B - $30M raised' },
  ],
  employees: [
    { name: 'Jane Smith', role: 'CEO & Co-Founder' },
    { name: 'Mike Johnson', role: 'CTO & Co-Founder' },
    { name: 'Sarah Williams', role: 'VP of Engineering' },
    { name: 'David Brown', role: 'Head of Product' },
    { name: 'Emily Davis', role: 'General Counsel' },
  ],
  newsArticles: [
    { title: 'Acme Corp Raises $30M Series B', source: 'TechCrunch', date: '2024-03-15' },
    { title: 'Acme Expands to European Markets', source: 'Business Insider', date: '2024-01-22' },
    { title: 'Interview: Building Enterprise SaaS', source: 'Forbes', date: '2023-11-08' },
  ],
  legalFilings: [
    { type: 'Trademark Registration', date: '2023-08-12', status: 'Approved' },
    { type: 'Patent Application', date: '2024-02-28', status: 'Pending' },
    { type: 'SEC Filing', date: '2024-01-15', status: 'Filed' },
  ],
};

export const mockRedactoResults: RedactoResult[] = [
  {
    category: 'Data Broker Listings',
    findings: [
      { item: 'Spokeo - Full profile with address history', risk: 'high', action: 'Opt-out request drafted' },
      { item: 'WhitePages - Phone and address listed', risk: 'high', action: 'Removal request drafted' },
      { item: 'BeenVerified - Personal records found', risk: 'medium', action: 'Opt-out request drafted' },
      { item: 'Intelius - Background check available', risk: 'high', action: 'Deletion request drafted' },
    ],
  },
  {
    category: 'Privacy Violations',
    findings: [
      { item: 'CCPA violation - Data sold without consent', risk: 'high', action: 'Legal notice drafted' },
      { item: 'GDPR non-compliance - EU data retention', risk: 'medium', action: 'Data deletion request drafted' },
    ],
  },
  {
    category: 'Breach Notifications',
    findings: [
      { item: 'Equifax breach - Eligible for settlement', risk: 'high', action: 'Claim form prepared' },
      { item: 'LinkedIn breach - Data exposed', risk: 'medium', action: 'Notification documented' },
      { item: 'Yahoo breach - Account compromised', risk: 'medium', action: 'Claim eligibility checked' },
    ],
  },
  {
    category: 'Marketing Lists',
    findings: [
      { item: 'Email on 3 marketing databases', risk: 'low', action: 'Unsubscribe requests drafted' },
      { item: 'Phone on telemarketing list', risk: 'medium', action: 'Do-not-call request drafted' },
    ],
  },
];

export const mockDrafts: DraftItem[] = [
  {
    id: '1',
    type: 'Data Broker Removal',
    title: 'Spokeo Opt-Out Request',
    content: 'Request to remove personal information from Spokeo database pursuant to CCPA...',
    status: 'pending',
  },
  {
    id: '2',
    type: 'Data Broker Removal',
    title: 'WhitePages Removal Request',
    content: 'Formal request to delete all personal records from WhitePages...',
    status: 'pending',
  },
  {
    id: '3',
    type: 'Data Broker Removal',
    title: 'BeenVerified Opt-Out',
    content: 'Request to opt-out of BeenVerified data collection and sharing...',
    status: 'pending',
  },
  {
    id: '4',
    type: 'Legal Claim',
    title: 'Equifax Settlement Claim',
    content: 'Claim form for Equifax data breach settlement - estimated value $125-500...',
    status: 'pending',
  },
  {
    id: '5',
    type: 'Privacy Request',
    title: 'CCPA Data Deletion Request',
    content: 'Formal CCPA request to delete all personal data held by identified parties...',
    status: 'pending',
  },
  {
    id: '6',
    type: 'Do Not Call',
    title: 'Telemarketing Opt-Out',
    content: 'Request to add phone number to internal do-not-call list...',
    status: 'pending',
  },
];

// Streaming simulation data
export const userDiscoverySteps = [
  { message: 'Initializing Firecrawl...', delay: 500 },
  { message: 'Searching social media platforms...', delay: 1200 },
  { message: 'Found LinkedIn profile', delay: 800, type: 'social' as const, category: 'socialProfiles' as const, itemId: 'linkedin' },
  { message: 'Found Twitter account', delay: 600, type: 'social' as const, category: 'socialProfiles' as const, itemId: 'twitter' },
  { message: 'Found GitHub profile', delay: 500, type: 'social' as const, category: 'socialProfiles' as const, itemId: 'github' },
  { message: 'Scanning data breach databases...', delay: 1000 },
  { message: 'Alert: Found in LinkedIn 2021 breach', delay: 700, type: 'breach' as const, category: 'dataBreaches' as const, itemId: 'breach-linkedin' },
  { message: 'Alert: Found in Adobe 2019 breach', delay: 600, type: 'breach' as const, category: 'dataBreaches' as const, itemId: 'breach-adobe' },
  { message: 'Alert: Found in Equifax 2017 breach', delay: 800, type: 'breach' as const, category: 'dataBreaches' as const, itemId: 'breach-equifax' },
  { message: 'Alert: Found in Yahoo 2016 breach', delay: 500, type: 'breach' as const, category: 'dataBreaches' as const, itemId: 'breach-yahoo' },
  { message: 'Checking public records...', delay: 900 },
  { message: 'Found property records', delay: 600, type: 'record' as const, category: 'publicRecords' as const, itemId: 'record-property' },
  { message: 'Found voter registration', delay: 400, type: 'record' as const, category: 'publicRecords' as const, itemId: 'record-voter' },
  { message: 'Analyzing online presence...', delay: 800 },
  { message: 'Found company website listing', delay: 500, type: 'presence' as const, category: 'onlinePresence' as const, itemId: 'presence-company' },
  { message: 'Found Medium articles', delay: 400, type: 'presence' as const, category: 'onlinePresence' as const, itemId: 'presence-medium' },
  { message: 'Discovery complete', delay: 500 },
];

export const companyDiscoverySteps = [
  { message: 'Starting company analysis...', delay: 500 },
  { message: 'Fetching company registration data...', delay: 1000 },
  { message: 'Found: Acme Corporation Inc.', delay: 600, type: 'info' as const },
  { message: 'Analyzing company structure...', delay: 800 },
  { message: 'Found 5 key executives', delay: 500, type: 'employee' as const },
  { message: 'Scanning news sources...', delay: 900 },
  { message: 'Found 3 recent articles', delay: 600, type: 'news' as const },
  { message: 'Checking legal filings...', delay: 1000 },
  { message: 'Found trademark registration', delay: 500, type: 'legal' as const },
  { message: 'Found patent application', delay: 400, type: 'legal' as const },
  { message: 'Found SEC filing', delay: 400, type: 'legal' as const },
  { message: 'Company analysis complete', delay: 500 },
];

export const redactoSteps = [
  { message: 'Connecting to Redacto API...', delay: 600 },
  { message: 'Uploading discovered data...', delay: 800 },
  { message: 'Analyzing data broker listings...', delay: 1200 },
  { message: 'Found on Spokeo - HIGH RISK', delay: 500, type: 'finding' as const, risk: 'high' as const },
  { message: 'Found on WhitePages - HIGH RISK', delay: 400, type: 'finding' as const, risk: 'high' as const },
  { message: 'Found on BeenVerified - MEDIUM RISK', delay: 400, type: 'finding' as const, risk: 'medium' as const },
  { message: 'Checking privacy violations...', delay: 900 },
  { message: 'CCPA violation detected', delay: 600, type: 'finding' as const, risk: 'high' as const },
  { message: 'Analyzing breach eligibility...', delay: 800 },
  { message: 'Eligible for Equifax settlement', delay: 500, type: 'finding' as const, risk: 'high' as const },
  { message: 'Generating removal requests...', delay: 1000 },
  { message: 'Drafting legal notices...', delay: 800 },
  { message: 'Preparing claim forms...', delay: 700 },
  { message: 'Analysis complete - 6 drafts ready', delay: 500 },
];

// Graph flow structure: Individual Source → Data Item → Claim Document → Claim Source
export interface GraphFlowData {
  individualSources: {
    id: string;
    name: string;
    type: 'social' | 'breach' | 'record' | 'presence' | 'broker';
    dataItems: string[]; // IDs of data items from this source
  }[];
  dataItems: {
    id: string;
    type: string; // Email, Phone, SSN, Address, etc.
    sources: string[]; // IDs of individual sources
    documents: string[]; // IDs of claim documents
  }[];
  claimDocuments: {
    id: string;
    title: string;
    type: string;
    claimSource: string; // ID of claim source category
    dataItems: string[]; // IDs of data items this document addresses
  }[];
  claimSources: {
    id: string;
    name: string;
    risk: 'high' | 'medium' | 'low';
    documents: string[]; // IDs of claim documents
  }[];
}

export const graphFlowData: GraphFlowData = {
  individualSources: [
    { id: 'linkedin', name: 'LinkedIn', type: 'social', dataItems: ['email', 'phone', 'employment'] },
    { id: 'twitter', name: 'Twitter', type: 'social', dataItems: ['email', 'username'] },
    { id: 'github', name: 'GitHub', type: 'social', dataItems: ['email', 'username'] },
    { id: 'breach-linkedin', name: 'LinkedIn 2021 Breach', type: 'breach', dataItems: ['email', 'phone', 'employment'] },
    { id: 'breach-adobe', name: 'Adobe 2019 Breach', type: 'breach', dataItems: ['email', 'password', 'username'] },
    { id: 'breach-equifax', name: 'Equifax 2017 Breach', type: 'breach', dataItems: ['ssn', 'dob', 'address', 'credit'] },
    { id: 'breach-yahoo', name: 'Yahoo 2016 Breach', type: 'breach', dataItems: ['email', 'password'] },
    { id: 'spokeo', name: 'Spokeo', type: 'broker', dataItems: ['address', 'phone', 'relatives'] },
    { id: 'whitepages', name: 'WhitePages', type: 'broker', dataItems: ['phone', 'address'] },
    { id: 'beenverified', name: 'BeenVerified', type: 'broker', dataItems: ['records', 'background'] },
    { id: 'record-property', name: 'Property Records', type: 'record', dataItems: ['address', 'ownership'] },
    { id: 'record-voter', name: 'Voter Registration', type: 'record', dataItems: ['address', 'party'] },
    { id: 'presence-medium', name: 'Medium', type: 'presence', dataItems: ['articles', 'profile'] },
  ],
  dataItems: [
    { id: 'email', type: 'Email Address', sources: ['linkedin', 'twitter', 'github', 'breach-linkedin', 'breach-adobe', 'breach-yahoo'], documents: ['doc-ccpa', 'doc-marketing'] },
    { id: 'phone', type: 'Phone Number', sources: ['linkedin', 'breach-linkedin', 'spokeo', 'whitepages'], documents: ['doc-spokeo', 'doc-whitepages', 'doc-telemarketing'] },
    { id: 'employment', type: 'Employment History', sources: ['linkedin', 'breach-linkedin'], documents: ['doc-spokeo'] },
    { id: 'username', type: 'Username', sources: ['twitter', 'github', 'breach-adobe'], documents: [] },
    { id: 'password', type: 'Password Hash', sources: ['breach-adobe', 'breach-yahoo'], documents: [] },
    { id: 'ssn', type: 'Social Security Number', sources: ['breach-equifax'], documents: ['doc-equifax'] },
    { id: 'dob', type: 'Date of Birth', sources: ['breach-equifax'], documents: ['doc-equifax'] },
    { id: 'address', type: 'Address History', sources: ['breach-equifax', 'spokeo', 'whitepages', 'record-property', 'record-voter'], documents: ['doc-spokeo', 'doc-whitepages', 'doc-equifax'] },
    { id: 'credit', type: 'Credit Score', sources: ['breach-equifax'], documents: ['doc-equifax'] },
    { id: 'relatives', type: 'Relatives Info', sources: ['spokeo'], documents: ['doc-spokeo'] },
    { id: 'records', type: 'Public Records', sources: ['beenverified'], documents: ['doc-beenverified'] },
    { id: 'background', type: 'Background Check', sources: ['beenverified'], documents: ['doc-beenverified'] },
    { id: 'ownership', type: 'Property Ownership', sources: ['record-property'], documents: [] },
    { id: 'party', type: 'Political Affiliation', sources: ['record-voter'], documents: [] },
    { id: 'articles', type: 'Published Articles', sources: ['presence-medium'], documents: [] },
    { id: 'profile', type: 'Public Profile', sources: ['presence-medium'], documents: [] },
  ],
  claimDocuments: [
    { id: 'doc-spokeo', title: 'Spokeo Opt-Out Request', type: 'Data Broker Removal', claimSource: 'data-brokers', dataItems: ['phone', 'address', 'employment', 'relatives'] },
    { id: 'doc-whitepages', title: 'WhitePages Removal', type: 'Data Broker Removal', claimSource: 'data-brokers', dataItems: ['phone', 'address'] },
    { id: 'doc-beenverified', title: 'BeenVerified Opt-Out', type: 'Data Broker Removal', claimSource: 'data-brokers', dataItems: ['records', 'background'] },
    { id: 'doc-equifax', title: 'Equifax Settlement Claim', type: 'Legal Claim', claimSource: 'breaches', dataItems: ['ssn', 'dob', 'address', 'credit'] },
    { id: 'doc-ccpa', title: 'CCPA Data Deletion', type: 'Privacy Request', claimSource: 'privacy', dataItems: ['email', 'phone', 'address'] },
    { id: 'doc-telemarketing', title: 'Telemarketing Opt-Out', type: 'Do Not Call', claimSource: 'marketing', dataItems: ['phone'] },
    { id: 'doc-marketing', title: 'Email Marketing Opt-Out', type: 'Unsubscribe', claimSource: 'marketing', dataItems: ['email'] },
  ],
  claimSources: [
    { id: 'data-brokers', name: 'Data Broker Listings', risk: 'high', documents: ['doc-spokeo', 'doc-whitepages', 'doc-beenverified'] },
    { id: 'breaches', name: 'Breach Notifications', risk: 'high', documents: ['doc-equifax'] },
    { id: 'privacy', name: 'Privacy Violations', risk: 'high', documents: ['doc-ccpa'] },
    { id: 'marketing', name: 'Marketing Lists', risk: 'medium', documents: ['doc-telemarketing', 'doc-marketing'] },
  ],
};
