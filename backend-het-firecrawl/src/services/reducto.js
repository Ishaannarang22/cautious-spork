import Reducto, { toFile } from 'reductoai';

// Lazy-initialize Reducto client
let client = null;

function getClient() {
  if (!client) {
    if (!process.env.REDUCTO_API_KEY) {
      throw new Error('REDUCTO_API_KEY environment variable is not set. Get your API key at https://reducto.ai');
    }
    client = new Reducto({
      apiKey: process.env.REDUCTO_API_KEY,
    });
  }
  return client;
}

/**
 * Parse a document from URL
 * @param {string} documentUrl - URL to the document
 * @returns {Promise<object>} Parsed document content
 */
export async function parseDocument(documentUrl) {
  const response = await getClient().parse.run({
    document_url: documentUrl,
  });
  return response;
}

/**
 * Parse a document from a file buffer
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @returns {Promise<object>} Parsed document content
 */
export async function parseFile(fileBuffer, filename) {
  // First upload the file
  const file = await toFile(fileBuffer, filename);
  const uploadResponse = await getClient().upload({ file });

  console.log('Upload response:', JSON.stringify(uploadResponse, null, 2));

  // Get the URL from upload response
  const documentUrl = uploadResponse.url || uploadResponse.document_url || `reducto://${uploadResponse.file_id}`;

  // Then parse using the uploaded file URL
  const response = await getClient().parse.run({
    document_url: documentUrl,
  });
  return response;
}

/**
 * Extract structured data from a document URL using a JSON schema
 * @param {string} documentUrl - URL to the document
 * @param {object} schema - JSON schema defining fields to extract
 * @param {object} options - Optional extraction configuration
 * @returns {Promise<object>} Extracted structured data
 */
export async function extractFromDocument(documentUrl, schema, options = {}) {
  const response = await getClient().extract.run({
    document_url: documentUrl,
    schema,
    system_prompt: options.systemPrompt || '',
  });
  return response;
}

/**
 * Extract structured data from a file buffer
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @param {object} schema - JSON schema defining fields to extract
 * @param {object} options - Optional extraction configuration
 * @returns {Promise<object>} Extracted structured data
 */
export async function extractFromFile(fileBuffer, filename, schema, options = {}) {
  // First upload the file
  const file = await toFile(fileBuffer, filename);
  const uploadResponse = await getClient().upload({ file });

  // Get the URL from upload response
  const documentUrl = uploadResponse.url || uploadResponse.document_url || `reducto://${uploadResponse.file_id}`;

  const response = await getClient().extract.run({
    document_url: documentUrl,
    schema,
    system_prompt: options.systemPrompt || '',
  });
  return response;
}

/**
 * Upload a file to Reducto for processing
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @returns {Promise<object>} Upload response with reducto:// URL
 */
export async function uploadFile(fileBuffer, filename) {
  const file = await toFile(fileBuffer, filename);
  const response = await getClient().upload({ file });
  return response;
}

/**
 * Split a document into sections based on natural language descriptions
 * @param {string} documentUrl - URL to the document
 * @param {string[]} partitionDescriptions - Array of section descriptions
 * @returns {Promise<object>} Split document sections
 */
export async function splitDocument(documentUrl, partitionDescriptions) {
  const response = await getClient().split.run({
    document_url: documentUrl,
    split_description: partitionDescriptions,
  });
  return response;
}

/**
 * Get the status of an async job
 * @param {string} jobId - The job ID to check
 * @returns {Promise<object>} Job status
 */
export async function getJobStatus(jobId) {
  const response = await getClient().jobs.retrieve(jobId);
  return response;
}

/**
 * Edit/fill a PDF form with provided data
 * @param {string} documentUrl - URL to the document
 * @param {string} editInstructions - Natural language instructions for filling
 * @param {object} options - Optional edit configuration
 * @returns {Promise<object>} Edited document URL
 */
export async function editDocument(documentUrl, editInstructions, options = {}) {
  const response = await getClient().edit.run({
    document_url: documentUrl,
    edit_instructions: editInstructions,
    ...(options.formSchema && { form_schema: options.formSchema }),
    ...(options.editOptions && { edit_options: options.editOptions }),
  });
  return response;
}

/**
 * Edit/fill a PDF form from a file buffer
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} editInstructions - Natural language instructions for filling
 * @param {object} options - Optional edit configuration
 * @returns {Promise<object>} Edited document URL
 */
export async function editFile(fileBuffer, filename, editInstructions, options = {}) {
  // First upload the file
  const file = await toFile(fileBuffer, filename);
  const uploadResponse = await getClient().upload({ file });

  const documentUrl = uploadResponse.url || uploadResponse.document_url || `reducto://${uploadResponse.file_id}`;

  const response = await getClient().edit.run({
    document_url: documentUrl,
    edit_instructions: editInstructions,
    ...(options.formSchema && { form_schema: options.formSchema }),
    ...(options.editOptions && { edit_options: options.editOptions }),
  });
  return response;
}

/**
 * Detect form fields in a PDF by parsing it
 * @param {string} documentUrl - URL to the document
 * @returns {Promise<object>} Detected form fields
 */
export async function detectFormFields(documentUrl) {
  console.log('Parsing document to detect form fields:', documentUrl);

  // Use parse to analyze the document structure
  const parseResponse = await getClient().parse.run({
    document_url: documentUrl,
  });

  // Extract form-like blocks (key-value pairs, text fields)
  const formFields = [];
  const chunks = parseResponse.result?.chunks || [];

  for (const chunk of chunks) {
    for (const block of (chunk.blocks || [])) {
      if (block.type === 'Key Value' || block.type === 'Text') {
        formFields.push({
          type: 'text',
          description: block.content?.toString().substring(0, 100) || 'Unknown field',
          bbox: block.bbox,
          confidence: block.confidence,
        });
      }
    }
  }

  return {
    document_url: documentUrl,
    form_schema: formFields,
    usage: parseResponse.usage,
    studio_link: parseResponse.studio_link,
  };
}

/**
 * Detect form fields from a file buffer by parsing
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @returns {Promise<object>} Detected form fields
 */
export async function detectFormFieldsFromFile(fileBuffer, filename) {
  console.log('Uploading file for field detection:', filename);
  const file = await toFile(fileBuffer, filename);
  const uploadResponse = await getClient().upload({ file });

  const documentUrl = uploadResponse.url || uploadResponse.document_url || `reducto://${uploadResponse.file_id}`;
  console.log('File uploaded, document URL:', documentUrl);

  // Use parse to analyze the document
  const parseResponse = await getClient().parse.run({
    document_url: documentUrl,
  });

  // Extract form-like blocks
  const formFields = [];
  const chunks = parseResponse.result?.chunks || [];

  for (const chunk of chunks) {
    for (const block of (chunk.blocks || [])) {
      if (block.type === 'Key Value' || block.type === 'Text') {
        formFields.push({
          type: 'text',
          description: block.content?.toString().substring(0, 100) || 'Unknown field',
          bbox: block.bbox,
          confidence: block.confidence,
        });
      }
    }
  }

  console.log(`Detected ${formFields.length} potential form fields`);

  return {
    document_url: documentUrl,
    form_schema: formFields,
    usage: parseResponse.usage,
    studio_link: parseResponse.studio_link,
  };
}

// Pre-defined schemas for common document types
export const schemas = {
  personalInfo: {
    type: 'object',
    properties: {
      fullName: { type: 'string', description: 'Full legal name' },
      email: { type: 'string', description: 'Email address' },
      phone: { type: 'string', description: 'Phone number' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zipCode: { type: 'string' },
          country: { type: 'string' },
        },
      },
      dateOfBirth: { type: 'string', description: 'Date of birth' },
      ssn: { type: 'string', description: 'Social Security Number (last 4 digits only)' },
    },
  },

  financialInfo: {
    type: 'object',
    properties: {
      accountNumber: { type: 'string', description: 'Account number' },
      bankName: { type: 'string', description: 'Bank or financial institution name' },
      transactions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number' },
            type: { type: 'string', enum: ['credit', 'debit'] },
          },
        },
      },
      balance: { type: 'number', description: 'Current balance' },
      statementDate: { type: 'string', description: 'Statement date' },
    },
  },

  employmentInfo: {
    type: 'object',
    properties: {
      employerName: { type: 'string', description: 'Employer name' },
      employerAddress: { type: 'string', description: 'Employer address' },
      employeeId: { type: 'string', description: 'Employee ID' },
      jobTitle: { type: 'string', description: 'Job title or position' },
      startDate: { type: 'string', description: 'Employment start date' },
      endDate: { type: 'string', description: 'Employment end date if applicable' },
      salary: { type: 'number', description: 'Annual salary or hourly rate' },
      payPeriod: { type: 'string', description: 'Pay period (weekly, bi-weekly, monthly)' },
    },
  },

  claimInfo: {
    type: 'object',
    properties: {
      claimType: {
        type: 'string',
        description: 'Type of claim (data breach, unclaimed property, class action, etc.)'
      },
      companyInvolved: { type: 'string', description: 'Company or entity involved' },
      incidentDate: { type: 'string', description: 'Date of incident or relevant period' },
      estimatedValue: { type: 'number', description: 'Estimated claim value' },
      deadline: { type: 'string', description: 'Claim submission deadline' },
      caseNumber: { type: 'string', description: 'Case or reference number' },
      eligibilityCriteria: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of eligibility criteria',
      },
    },
  },

  identityDocument: {
    type: 'object',
    properties: {
      documentType: {
        type: 'string',
        enum: ['drivers_license', 'passport', 'state_id', 'military_id', 'other'],
        description: 'Type of identity document'
      },
      documentNumber: { type: 'string', description: 'Document number' },
      issuingAuthority: { type: 'string', description: 'Issuing authority or state' },
      issueDate: { type: 'string', description: 'Issue date' },
      expirationDate: { type: 'string', description: 'Expiration date' },
      fullName: { type: 'string', description: 'Name as shown on document' },
      dateOfBirth: { type: 'string', description: 'Date of birth' },
      address: { type: 'string', description: 'Address on document' },
    },
  },
};

export default {
  parseDocument,
  parseFile,
  extractFromDocument,
  extractFromFile,
  uploadFile,
  splitDocument,
  getJobStatus,
  editDocument,
  editFile,
  detectFormFields,
  detectFormFieldsFromFile,
  schemas,
};
