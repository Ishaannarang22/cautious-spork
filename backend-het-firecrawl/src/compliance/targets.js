function buildRobocallQueries(company) {
  return [
    `${company} privacy policy phone calls text messages`,
    `${company} marketing communications policy`,
    `${company} terms of service marketing calls`,
    `site:fcc.gov ${company} robocall`,
    `site:ftc.gov ${company} telemarketing`
  ];
}

function buildBreachQueries(company) {
  return [
    `${company} data breach notice`,
    `${company} security incident`,
    `${company} cybersecurity incident disclosure`,
    `site:oag.ca.gov ${company} data breach`,
    `${company} breach notification letter`
  ];
}

function buildCcpaQueries(company) {
  return [
    `${company} California privacy rights`,
    `${company} CCPA request`,
    `${company} CPRA privacy policy`,
    `${company} do not sell or share`,
    `${company} data request portal`
  ];
}

module.exports = {
  buildRobocallQueries,
  buildBreachQueries,
  buildCcpaQueries
};
