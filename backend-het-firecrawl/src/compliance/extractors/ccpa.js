const { toLower, findSnippets, pickFirstDate } = require('../utils');

const CCPA_PATTERNS = [
  'ccpa',
  'cpra',
  'california\s+consumer\s+privacy\s+act',
  'california\s+privacy\s+rights',
  'do\s+not\s+sell',
  'do\s+not\s+share'
];

const REQUEST_METHODS = [
  { key: 'email', patterns: ['email', 'email\s+us', 'privacy@'] },
  { key: 'webform', patterns: ['web\s+form', 'online\s+form', 'request\s+form', 'submit\s+a\s+request'] },
  { key: 'phone', patterns: ['toll\s*-?\s*free', 'call\s+us', 'phone'] },
  { key: 'mail', patterns: ['mail\s+to', 'postal\s+mail', 'write\s+to'] }
];

const RESPONSE_TIMELINE_PATTERNS = [
  'within\s+45\s+days',
  '45\s+days',
  'within\s+90\s+days',
  'extend\s+by\s+45\s+days'
];

const VERIFICATION_PATTERNS = [
  'verify\s+your\s+identity',
  'verification\s+process',
  'request\s+verification',
  'confirm\s+your\s+identity'
];

const LAST_UPDATED_PATTERNS = [
  'last\s+updated',
  'effective\s+date',
  'last\s+revised'
];

function extractCcpaSignals({ url, text }) {
  const lowered = toLower(text);
  const ccpaDisclosed = CCPA_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));
  const responseTimeline = RESPONSE_TIMELINE_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));
  const verification = VERIFICATION_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));

  const requestMethods = [];
  REQUEST_METHODS.forEach((method) => {
    if (method.patterns.some((pattern) => new RegExp(pattern, 'i').test(lowered))) {
      requestMethods.push(method.key);
    }
  });

  let lastUpdatedDate = null;
  if (LAST_UPDATED_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered))) {
    lastUpdatedDate = pickFirstDate(text);
  }

  const evidencePatterns = [
    ...CCPA_PATTERNS,
    ...REQUEST_METHODS.flatMap((method) => method.patterns),
    ...RESPONSE_TIMELINE_PATTERNS,
    ...VERIFICATION_PATTERNS,
    ...LAST_UPDATED_PATTERNS
  ];

  const snippets = findSnippets(text, evidencePatterns);

  const fieldsSupported = [];
  if (ccpaDisclosed) fieldsSupported.push('ccpa_rights_disclosed');
  if (requestMethods.length) fieldsSupported.push('request_methods_listed');
  if (responseTimeline) fieldsSupported.push('response_timeline_stated');
  if (verification) fieldsSupported.push('verification_requirements_described');
  if (lastUpdatedDate) fieldsSupported.push('privacy_policy_last_updated');

  return {
    url,
    ccpaDisclosed,
    requestMethods,
    responseTimelineStated: responseTimeline,
    verificationRequirements: verification,
    privacyPolicyLastUpdated: lastUpdatedDate,
    fieldsSupported,
    snippets
  };
}

module.exports = {
  extractCcpaSignals
};
