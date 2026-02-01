const { toLower, findSnippets } = require('../utils');

const CALLING_PATTERNS = [
  'robocall',
  'autodial',
  'automatic\s+dial',
  'prerecorded',
  'telemarketing',
  'marketing\s+call',
  'phone\s+call',
  'call\s+you'
];

const TEXT_PATTERNS = [
  'text\s+message',
  '\bsms\b',
  'mobile\s+message',
  'marketing\s+text',
  '\bmms\b'
];

const OPT_OUT_PATTERNS = [
  'opt\s*out',
  'unsubscribe',
  'reply\s+stop',
  'stop\s+messages',
  'text\s+stop'
];

const CONSENT_PATTERNS = [
  'consent',
  'prior\s+express\s+consent',
  'opt\s*in',
  'authorized',
  'agree\s+to\s+receive'
];

const REGULATORY_PATTERNS = [
  'fcc',
  'ftc',
  'consent\s+decree',
  'settlement',
  'notice\s+of\s+apparent\s+liability',
  'complaint'
];

function extractRobocallSignals({ url, text }) {
  const lowered = toLower(text);
  const calling = CALLING_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));
  const texting = TEXT_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));
  const optOut = OPT_OUT_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));
  const consent = CONSENT_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));
  const regulatory = REGULATORY_PATTERNS.some((pattern) => new RegExp(pattern, 'i').test(lowered));

  const evidencePatterns = [
    ...CALLING_PATTERNS,
    ...TEXT_PATTERNS,
    ...OPT_OUT_PATTERNS,
    ...CONSENT_PATTERNS,
    ...REGULATORY_PATTERNS
  ];

  const snippets = findSnippets(text, evidencePatterns);

  const fieldsSupported = [];
  if (calling) fieldsSupported.push('calling_practices_disclosed');
  if (texting) fieldsSupported.push('text_marketing_disclosed');
  if (optOut) fieldsSupported.push('opt_out_mechanism_described');
  if (consent) fieldsSupported.push('consent_language_present');
  if (regulatory) fieldsSupported.push('regulatory_actions_found');

  return {
    url,
    fieldsSupported,
    snippets
  };
}

module.exports = {
  extractRobocallSignals
};
