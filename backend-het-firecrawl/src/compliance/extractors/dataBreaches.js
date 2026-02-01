const { toLower, findSnippets, pickFirstDate } = require('../utils');

const BREACH_PATTERNS = [
  'data\s+breach',
  'security\s+incident',
  'cybersecurity\s+incident',
  'unauthorized\s+access',
  'incident\s+notice',
  'breach\s+notification'
];

const CALIFORNIA_PATTERNS = [
  'california',
  'california\s+attorney\s+general',
  'california\s+residents'
];

const DATA_TYPE_MAP = [
  { key: 'email', patterns: ['email'] },
  { key: 'phone', patterns: ['phone', 'telephone', 'mobile'] },
  { key: 'passwords', patterns: ['password'] },
  { key: 'ssn', patterns: ['social\s+security', '\bssn\b'] },
  { key: 'address', patterns: ['address', 'mailing'] },
  { key: 'payment', patterns: ['credit\s+card', 'debit\s+card', 'payment'] },
  { key: 'financial', patterns: ['bank\s+account', 'financial'] },
  { key: 'dob', patterns: ['date\s+of\s+birth', '\bdob\b'] },
  { key: 'drivers_license', patterns: ['driver\'s\s+license', 'drivers\s+license'] },
  { key: 'account', patterns: ['account\s+number'] },
  { key: 'biometric', patterns: ['biometric', 'fingerprint', 'face\s+template'] }
];

function extractDataBreachSignals({ url, text }) {
  const lowered = toLower(text);
  const breachDisclosed = BREACH_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));
  const californiaMentioned = CALIFORNIA_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));

  const dataTypes = [];
  DATA_TYPE_MAP.forEach((entry) => {
    if (entry.patterns.some((pattern) => new RegExp(pattern, 'i').test(lowered))) {
      dataTypes.push(entry.key);
    }
  });

  const date = pickFirstDate(text);

  const evidencePatterns = [
    ...BREACH_PATTERNS,
    ...CALIFORNIA_PATTERNS,
    ...DATA_TYPE_MAP.flatMap((entry) => entry.patterns)
  ];

  const snippets = findSnippets(text, evidencePatterns);

  const fieldsSupported = [];
  if (breachDisclosed) fieldsSupported.push('public_breach_disclosed');
  if (date) fieldsSupported.push('breach_disclosure_date');
  if (dataTypes.length) fieldsSupported.push('data_types_affected');
  if (californiaMentioned) fieldsSupported.push('california_notice_mentioned');

  return {
    url,
    breachDisclosed,
    breachDisclosureDate: date,
    dataTypesAffected: dataTypes,
    californiaNoticeMentioned: californiaMentioned,
    fieldsSupported,
    snippets
  };
}

module.exports = {
  extractDataBreachSignals
};
