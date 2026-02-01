/**
 * Form Catalog - Registry of available PDF forms
 * Each form has metadata to help the LLM choose the right one
 */

export const formCatalog = [
  {
    id: 'data-breach-claim',
    name: 'Data Breach Claim Form',
    filename: 'data-breach-claim.pdf',
    description: 'For claiming compensation when your personal data was exposed in a data breach. Includes fields for breach details, affected data types, and damages.',
    useCases: [
      'Personal data was exposed in a hack or breach',
      'Company notified user of data compromise',
      'Identity theft resulting from data exposure',
      'Credit monitoring needed due to breach',
    ],
    requiredFields: ['fullName', 'email', 'breachDate', 'companyName', 'dataTypesExposed'],
    optionalFields: ['ssn', 'accountNumber', 'damages', 'identityTheftDetails'],
    claimTypes: ['data_breach', 'identity_theft', 'privacy_violation'],
  },
  {
    id: 'class-action-claim',
    name: 'Class Action Claim Form',
    filename: 'class-action-claim.pdf',
    description: 'For joining or filing claims in class action lawsuits. Used when many people were affected by the same issue.',
    useCases: [
      'Product defect affected many consumers',
      'Company overcharged customers systematically',
      'Securities fraud or investor losses',
      'Employment class action (wage theft, discrimination)',
    ],
    requiredFields: ['fullName', 'address', 'email', 'caseNumber', 'purchaseDate'],
    optionalFields: ['receiptNumber', 'purchaseAmount', 'proofOfPurchase'],
    claimTypes: ['class_action', 'consumer_protection', 'securities', 'employment'],
  },
  {
    id: 'unclaimed-property',
    name: 'Unclaimed Property Claim Form',
    filename: 'unclaimed-property.pdf',
    description: 'For claiming forgotten money, stocks, insurance payouts, or other unclaimed assets held by the state.',
    useCases: [
      'Forgotten bank account or safe deposit box',
      'Uncashed checks or payroll',
      'Insurance policy payout never received',
      'Stocks or dividends from old investments',
      'Utility deposits not returned',
    ],
    requiredFields: ['fullName', 'currentAddress', 'previousAddresses', 'ssn', 'propertyType'],
    optionalFields: ['accountNumber', 'companyName', 'estimatedValue', 'relationshipToOwner'],
    claimTypes: ['unclaimed_property', 'escheatment', 'forgotten_assets'],
  },
  {
    id: 'insurance-claim',
    name: 'Insurance Claim Form',
    filename: 'insurance-claim.pdf',
    description: 'General insurance claim form for filing claims against various insurance policies.',
    useCases: [
      'Health insurance claim denial appeal',
      'Auto insurance claim for accident',
      'Home insurance claim for damage',
      'Life insurance beneficiary claim',
    ],
    requiredFields: ['fullName', 'policyNumber', 'insuranceCompany', 'incidentDate', 'claimDescription'],
    optionalFields: ['claimAmount', 'policeReportNumber', 'medicalRecords', 'photos'],
    claimTypes: ['insurance', 'health_insurance', 'auto_insurance', 'home_insurance'],
  },
  {
    id: 'consumer-complaint',
    name: 'Consumer Complaint Form',
    filename: 'consumer-complaint.pdf',
    description: 'For filing complaints about unfair business practices, fraud, or consumer rights violations.',
    useCases: [
      'Deceptive advertising or false claims',
      'Refund not provided for defective product',
      'Unauthorized charges or billing errors',
      'Warranty not honored',
      'Scam or fraud by a business',
    ],
    requiredFields: ['fullName', 'email', 'companyName', 'complaintDescription', 'dateOfIncident'],
    optionalFields: ['transactionAmount', 'orderNumber', 'desiredResolution', 'previousAttempts'],
    claimTypes: ['consumer_complaint', 'fraud', 'deceptive_practices', 'refund'],
  },
  {
    id: 'employment-claim',
    name: 'Employment/Labor Claim Form',
    filename: 'employment-claim.pdf',
    description: 'For claims related to workplace issues like unpaid wages, discrimination, or wrongful termination.',
    useCases: [
      'Unpaid wages or overtime',
      'Workplace discrimination',
      'Wrongful termination',
      'Harassment complaint',
      'FMLA or leave violations',
    ],
    requiredFields: ['fullName', 'employerName', 'jobTitle', 'employmentDates', 'claimDescription'],
    optionalFields: ['salary', 'unpaidAmount', 'witnesses', 'hrComplaintDate'],
    claimTypes: ['employment', 'wage_theft', 'discrimination', 'wrongful_termination'],
  },
];

/**
 * Get form by ID
 */
export function getFormById(id) {
  return formCatalog.find(form => form.id === id);
}

/**
 * Get forms by claim type
 */
export function getFormsByClaimType(claimType) {
  return formCatalog.filter(form =>
    form.claimTypes.some(ct => ct.toLowerCase().includes(claimType.toLowerCase()))
  );
}

/**
 * Get all forms as a summary for LLM context
 */
export function getFormCatalogSummary() {
  return formCatalog.map(form => ({
    id: form.id,
    name: form.name,
    description: form.description,
    useCases: form.useCases,
    claimTypes: form.claimTypes,
  }));
}

export default formCatalog;
