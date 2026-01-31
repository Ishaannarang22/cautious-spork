export interface Claim {
  id: string;
  type: 'breach' | 'money' | 'privacy' | 'spam';
  title: string;
  description: string;
  fullDescription: string;
  urgency: 'urgent' | 'soon' | 'upcoming';
  estimatedValue: string;
  deadline: string;
  daysRemaining: number;
  eligibilityRequirements: string[];
  statuteReference: string;
  requiredDocuments: string[];
  status?: 'pending' | 'in_progress' | 'completed';
  progress?: number;
}

export const sampleClaims: Claim[] = [
  {
    id: '1',
    type: 'breach',
    title: 'Equifax Data Breach Settlement',
    description: 'You may be eligible for compensation from the 2017 Equifax data breach affecting 147 million consumers.',
    fullDescription: 'The Equifax data breach of 2017 exposed sensitive personal information including Social Security numbers, birth dates, addresses, and driver\'s license numbers of approximately 147 million consumers. As a result of the settlement, affected individuals may claim up to $125 in cash compensation or free credit monitoring services. Those who experienced identity theft or fraud may be eligible for up to $20,000 in additional compensation.',
    urgency: 'urgent',
    estimatedValue: '$125 - $500',
    deadline: 'Jan 22, 2025',
    daysRemaining: 14,
    eligibilityRequirements: [
      'Had an Equifax credit file as of September 2017',
      'U.S. resident at time of breach',
      'Personal information was exposed'
    ],
    statuteReference: 'In re: Equifax Inc. Customer Data Security Breach Litigation, Case No. 1:17-md-2800-TWT',
    requiredDocuments: ['Government-issued ID', 'Proof of address']
  },
  {
    id: '2',
    type: 'money',
    title: 'California Unclaimed Property',
    description: 'Unclaimed funds have been identified in your name from a previous financial account.',
    fullDescription: 'The California State Controller\'s Office holds billions of dollars in unclaimed property. Our search has identified potential unclaimed assets linked to your information, including dormant bank accounts, uncashed checks, insurance proceeds, and forgotten utility deposits. California law requires businesses to turn over property to the state after a period of inactivity.',
    urgency: 'soon',
    estimatedValue: '$847',
    deadline: 'Mar 15, 2025',
    daysRemaining: 45,
    eligibilityRequirements: [
      'California resident or former resident',
      'Property owner or legal heir',
      'Valid identification'
    ],
    statuteReference: 'California Code of Civil Procedure §§ 1500-1599',
    requiredDocuments: ['Government-issued ID', 'Proof of California residency', 'Social Security card']
  },
  {
    id: '3',
    type: 'breach',
    title: 'T-Mobile Data Breach Settlement',
    description: 'Eligible for compensation from the 2021 T-Mobile data breach affecting 76 million customers.',
    fullDescription: 'T-Mobile experienced a significant data breach in August 2021 that exposed personal data of approximately 76 million current, former, and prospective customers. The compromised data included names, Social Security numbers, dates of birth, and driver\'s license information. A $350 million settlement fund has been established to compensate affected individuals.',
    urgency: 'upcoming',
    estimatedValue: '$25 - $100',
    deadline: 'Apr 30, 2025',
    daysRemaining: 90,
    eligibilityRequirements: [
      'T-Mobile customer as of August 2021',
      'Personal information was compromised',
      'Received breach notification'
    ],
    statuteReference: 'In re: T-Mobile Customer Data Security Breach Litigation, Case No. 4:21-md-3019-BCW',
    requiredDocuments: ['T-Mobile account statement', 'Government-issued ID']
  },
  {
    id: '4',
    type: 'spam',
    title: 'TCPA Robocall Violation',
    description: 'You may be owed compensation for receiving illegal robocalls and spam text messages.',
    fullDescription: 'The Telephone Consumer Protection Act (TCPA) provides consumers with the right to sue companies that make unsolicited robocalls or send spam text messages without prior consent. Each violation can result in $500-$1,500 in statutory damages. Based on your phone records, you may have received calls from companies in violation of the TCPA.',
    urgency: 'soon',
    estimatedValue: '$500 - $1,500',
    deadline: 'Feb 28, 2025',
    daysRemaining: 30,
    eligibilityRequirements: [
      'Received automated calls without consent',
      'Phone number on National Do Not Call Registry',
      'Calls made for telemarketing purposes'
    ],
    statuteReference: '47 U.S.C. § 227 (Telephone Consumer Protection Act)',
    requiredDocuments: ['Phone records', 'Call log screenshots', 'Do Not Call Registry confirmation']
  },
  {
    id: '5',
    type: 'privacy',
    title: 'Facebook Privacy Settlement',
    description: 'Eligible for compensation from Facebook privacy violation class action settlement.',
    fullDescription: 'Facebook has agreed to a settlement following allegations that it violated user privacy by sharing personal data with third parties without adequate consent. The settlement covers users who had Facebook accounts between specified dates. Compensation varies based on the extent of data sharing and documented harm.',
    urgency: 'urgent',
    estimatedValue: '$50 - $200',
    deadline: 'Jan 30, 2025',
    daysRemaining: 21,
    eligibilityRequirements: [
      'Had Facebook account during class period',
      'U.S. resident',
      'Data was shared with third parties'
    ],
    statuteReference: 'In re: Facebook, Inc. Consumer Privacy User Profile Litigation, Case No. 3:18-md-02843-VC',
    requiredDocuments: ['Facebook account confirmation', 'Government-issued ID']
  },
  {
    id: '6',
    type: 'breach',
    title: 'Capital One Data Breach',
    description: 'Compensation available for the 2019 Capital One breach affecting 100 million individuals.',
    fullDescription: 'Capital One experienced a data breach in 2019 that exposed personal information of approximately 100 million individuals in the United States. The breach included names, addresses, phone numbers, email addresses, dates of birth, and self-reported income. A settlement fund has been established to provide compensation and free credit monitoring.',
    urgency: 'upcoming',
    estimatedValue: '$25 - $75',
    deadline: 'May 15, 2025',
    daysRemaining: 105,
    eligibilityRequirements: [
      'Applied for Capital One product before March 2019',
      'Received breach notification',
      'Personal data was exposed'
    ],
    statuteReference: 'In re: Capital One Consumer Data Security Breach Litigation, MDL No. 1:19-md-2915',
    requiredDocuments: ['Capital One notification letter', 'Government-issued ID']
  },
  {
    id: '7',
    type: 'breach',
    title: 'Yahoo Data Breach Settlement',
    description: 'Final deadline approaching for Yahoo data breach claims from 2013-2016 incidents.',
    fullDescription: 'Yahoo experienced multiple data breaches between 2013 and 2016 affecting approximately 3 billion user accounts. The breaches exposed names, email addresses, telephone numbers, dates of birth, hashed passwords, and security questions. A $117.5 million settlement fund provides compensation for affected users.',
    urgency: 'soon',
    estimatedValue: '$100 - $350',
    deadline: 'Feb 20, 2025',
    daysRemaining: 25,
    eligibilityRequirements: [
      'Had Yahoo account between 2012-2016',
      'U.S. resident',
      'Account was affected by breach'
    ],
    statuteReference: 'In re: Yahoo! Inc. Customer Data Security Breach Litigation, Case No. 16-MD-02752-LHK',
    requiredDocuments: ['Yahoo account information', 'Government-issued ID']
  },
  {
    id: '8',
    type: 'money',
    title: 'CA Unpaid Wage Claim',
    description: 'Potential unpaid wages, overtime, or meal break violations from California employers.',
    fullDescription: 'California has strong labor laws protecting workers\' rights to proper compensation. Our analysis indicates you may have claims for unpaid wages, overtime, missed meal or rest breaks, or unreimbursed business expenses. California law provides for recovery of unpaid amounts plus penalties and interest.',
    urgency: 'urgent',
    estimatedValue: '$200 - $2,000',
    deadline: 'Jan 25, 2025',
    daysRemaining: 17,
    eligibilityRequirements: [
      'Worked for California employer',
      'Experienced wage violations',
      'Within statute of limitations (3-4 years)'
    ],
    statuteReference: 'California Labor Code §§ 201-226, 510, 512',
    requiredDocuments: ['Pay stubs', 'Employment records', 'Time records']
  }
];

export const verificationQuestions = [
  {
    id: 1,
    question: 'Have you received suspicious data breach notifications?',
    icon: 'Shield'
  },
  {
    id: 2,
    question: 'Have you lived in California for over 2 years?',
    icon: 'MapPin'
  },
  {
    id: 3,
    question: 'Do you receive frequent spam/robocalls?',
    icon: 'Phone'
  },
  {
    id: 4,
    question: 'Have you had accounts with major retailers?',
    icon: 'ShoppingBag'
  },
  {
    id: 5,
    question: 'Do you own a vehicle registered in California?',
    icon: 'Car'
  },
  {
    id: 6,
    question: 'Have you worked for a California employer?',
    icon: 'Briefcase'
  }
];

export const scanningStatuses = [
  'Initializing search...',
  'Scanning data breach databases...',
  'Checking unclaimed property records...',
  'Searching class action settlements...',
  'Analyzing TCPA violations...',
  'Reviewing privacy law violations...',
  'Calculating potential recoveries...',
  'Preparing your claims...'
];
