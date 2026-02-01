const crypto = require('crypto');

const MONTHS = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
};

function normalizeText(input) {
  if (!input) return '';
  return input
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function toLower(input) {
  return normalizeText(input).toLowerCase();
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function stableId(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function extractIsoDate(text) {
  const isoMatch = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  return isoMatch ? isoMatch[0] : null;
}

function extractMonthDate(text) {
  const match = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(20\d{2})\b/i
  );
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  const day = String(match[2]).padStart(2, '0');
  const year = match[3];
  return `${year}-${String(month).padStart(2, '0')}-${day}`;
}

function pickFirstDate(text) {
  return extractIsoDate(text) || extractMonthDate(text);
}

function findSnippets(text, patterns, snippetRadius = 80) {
  const lowered = toLower(text);
  const snippets = [];

  patterns.forEach((pattern) => {
    const regex = new RegExp(pattern, 'gi');
    let match;
    while ((match = regex.exec(lowered)) !== null) {
      const start = Math.max(match.index - snippetRadius, 0);
      const end = Math.min(match.index + match[0].length + snippetRadius, lowered.length);
      const rawSnippet = text.slice(start, end);
      const snippet = normalizeText(rawSnippet);
      if (snippet) snippets.push(snippet);
    }
  });

  return uniqueStrings(snippets).slice(0, 5);
}

function sortByUrl(a, b) {
  return a.url.localeCompare(b.url);
}

module.exports = {
  normalizeText,
  toLower,
  uniqueStrings,
  stableId,
  extractIsoDate,
  extractMonthDate,
  pickFirstDate,
  findSnippets,
  sortByUrl
};
