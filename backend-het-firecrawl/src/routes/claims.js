import express from 'express';
import multer from 'multer';
import { withSSE } from '../utils/sse.js';
import reducto from '../services/reducto.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

/**
 * POST /api/claims/process
 * Full document processing pipeline with SSE progress updates
 *
 * Steps: upload → parse → extract → complete
 */
router.post('/process', upload.single('file'), withSSE(async (req, res, sse) => {
  if (!req.file) {
    return sse.error('No file uploaded');
  }

  const schemaType = req.body.schemaType || 'claimInfo';
  const schema = reducto.schemas[schemaType];

  if (!schema) {
    return sse.error(`Invalid schema type: ${schemaType}`);
  }

  // Step 1: Parsing
  sse.progress('parsing', 10, 'Uploading document...');

  const { toFile } = await import('reductoai');
  const file = await toFile(req.file.buffer, req.file.originalname);

  sse.progress('parsing', 20, 'Parsing document structure...');

  // Get client and upload
  const Reducto = (await import('reductoai')).default;
  const client = new Reducto({ apiKey: process.env.REDUCTO_API_KEY });

  const uploadResponse = await client.upload({ file });
  const documentUrl = uploadResponse.url || `reducto://${uploadResponse.file_id}`;

  sse.progress('parsing', 40, 'Extracting text and tables...');

  const parseResult = await client.parse.run({ document_url: documentUrl });

  sse.progress('extracting', 50, 'Analyzing document content...');

  // Step 2: Extract structured data
  sse.progress('extracting', 60, `Extracting ${schemaType} fields...`);

  const extractResult = await client.extract.run({
    document_url: documentUrl,
    schema,
    system_prompt: `Extract ${schemaType} from this document. Be thorough and accurate.`,
  });

  sse.progress('extracting', 80, 'Validating extracted data...');

  // Step 3: Complete
  sse.progress('complete', 100, 'Processing complete');

  sse.complete({
    documentUrl,
    parsed: {
      jobId: parseResult.job_id,
      chunks: parseResult.result?.chunks?.length || 0,
      pages: parseResult.usage?.num_pages || 1,
    },
    extracted: {
      jobId: extractResult.job_id,
      data: extractResult.result,
      fields: extractResult.usage?.num_fields || 0,
    },
  });
}));

/**
 * POST /api/claims/analyze
 * Analyze a document and extract claim-relevant information with SSE
 */
router.post('/analyze', upload.single('file'), withSSE(async (req, res, sse) => {
  if (!req.file) {
    return sse.error('No file uploaded');
  }

  sse.progress('starting', 5, 'Starting document analysis...');

  const { toFile } = await import('reductoai');
  const file = await toFile(req.file.buffer, req.file.originalname);

  sse.progress('uploading', 15, 'Uploading document...');

  const Reducto = (await import('reductoai')).default;
  const client = new Reducto({ apiKey: process.env.REDUCTO_API_KEY });

  const uploadResponse = await client.upload({ file });
  const documentUrl = uploadResponse.url || `reducto://${uploadResponse.file_id}`;

  // Step 1: Parse document
  sse.progress('parsing', 25, 'Parsing document...');

  const parseResult = await client.parse.run({ document_url: documentUrl });

  sse.progress('parsing', 40, 'Document parsed successfully');

  // Step 2: Extract personal info
  sse.progress('extracting', 45, 'Extracting personal information...');

  const personalResult = await client.extract.run({
    document_url: documentUrl,
    schema: reducto.schemas.personalInfo,
    system_prompt: 'Extract personal information from this document.',
  });

  sse.progress('extracting', 60, 'Personal info extracted');

  // Step 3: Extract claim info
  sse.progress('extracting', 65, 'Analyzing for claim eligibility...');

  const claimResult = await client.extract.run({
    document_url: documentUrl,
    schema: reducto.schemas.claimInfo,
    system_prompt: 'Extract any claim-related information including deadlines, case numbers, eligibility criteria.',
  });

  sse.progress('extracting', 80, 'Claim analysis complete');

  // Step 4: Extract financial info if relevant
  sse.progress('extracting', 85, 'Checking for financial data...');

  const financialResult = await client.extract.run({
    document_url: documentUrl,
    schema: reducto.schemas.financialInfo,
    system_prompt: 'Extract any financial information like account numbers, balances, or transaction data.',
  });

  sse.progress('finalizing', 95, 'Compiling results...');

  sse.complete({
    documentUrl,
    studioLink: parseResult.studio_link,
    analysis: {
      pages: parseResult.usage?.num_pages || 1,
      personalInfo: personalResult.result?.[0] || null,
      claimInfo: claimResult.result?.[0] || null,
      financialInfo: financialResult.result?.[0] || null,
    },
    summary: {
      hasPersonalInfo: Object.keys(personalResult.result?.[0] || {}).length > 0,
      hasClaimInfo: Object.keys(claimResult.result?.[0] || {}).length > 0,
      hasFinancialInfo: Object.keys(financialResult.result?.[0] || {}).length > 0,
    },
  });
}));

/**
 * POST /api/claims/draft
 * Parse user data, extract info, and fill a claim form with SSE
 */
router.post('/draft', upload.fields([
  { name: 'userDocument', maxCount: 1 },
  { name: 'claimForm', maxCount: 1 },
]), withSSE(async (req, res, sse) => {
  const userDoc = req.files?.userDocument?.[0];
  const claimForm = req.files?.claimForm?.[0];

  if (!userDoc) {
    return sse.error('User document is required');
  }

  if (!claimForm) {
    return sse.error('Claim form is required');
  }

  sse.progress('starting', 5, 'Starting claim draft process...');

  const { toFile } = await import('reductoai');
  const Reducto = (await import('reductoai')).default;
  const client = new Reducto({ apiKey: process.env.REDUCTO_API_KEY });

  // Step 1: Upload and extract from user document
  sse.progress('uploading', 10, 'Uploading user document...');

  const userFile = await toFile(userDoc.buffer, userDoc.originalname);
  const userUpload = await client.upload({ file: userFile });
  const userDocUrl = userUpload.url || `reducto://${userUpload.file_id}`;

  sse.progress('extracting', 25, 'Extracting user information...');

  const userInfo = await client.extract.run({
    document_url: userDocUrl,
    schema: reducto.schemas.personalInfo,
    system_prompt: 'Extract all personal information from this document.',
  });

  sse.progress('extracting', 40, 'User data extracted');

  // Step 2: Upload claim form and detect fields
  sse.progress('uploading', 45, 'Uploading claim form...');

  const formFile = await toFile(claimForm.buffer, claimForm.originalname);
  const formUpload = await client.upload({ file: formFile });
  const formUrl = formUpload.url || `reducto://${formUpload.file_id}`;

  sse.progress('analyzing', 55, 'Analyzing claim form fields...');

  // Step 3: Fill the form with extracted data
  sse.progress('drafting', 65, 'Filling claim form...');

  const userData = userInfo.result?.[0] || {};

  // Build fill instructions from extracted data
  const fillInstructions = [];
  if (userData.fullName) fillInstructions.push(`Full Name: ${userData.fullName}`);
  if (userData.email) fillInstructions.push(`Email: ${userData.email}`);
  if (userData.phone) fillInstructions.push(`Phone: ${userData.phone}`);
  if (userData.dateOfBirth) fillInstructions.push(`Date of Birth: ${userData.dateOfBirth}`);
  if (userData.address) {
    const addr = userData.address;
    if (addr.street) fillInstructions.push(`Street Address: ${addr.street}`);
    if (addr.city) fillInstructions.push(`City: ${addr.city}`);
    if (addr.state) fillInstructions.push(`State: ${addr.state}`);
    if (addr.zipCode) fillInstructions.push(`ZIP Code: ${addr.zipCode}`);
  }

  const instructions = `Fill the form with the following information:\n${fillInstructions.join('\n')}`;

  sse.progress('drafting', 80, 'Generating filled document...');

  const filledForm = await client.edit.run({
    document_url: formUrl,
    edit_instructions: instructions,
  });

  sse.progress('finalizing', 95, 'Finalizing draft...');

  sse.complete({
    filledFormUrl: filledForm.document_url,
    formSchema: filledForm.form_schema,
    extractedUserData: userData,
    fillInstructions: instructions,
  });
}));

/**
 * POST /api/claims/fill-form
 * Fill a claim form with provided user data (SSE)
 */
router.post('/fill-form', upload.single('file'), withSSE(async (req, res, sse) => {
  if (!req.file) {
    return sse.error('Claim form file is required');
  }

  let userData;
  try {
    userData = req.body.userData ? JSON.parse(req.body.userData) : null;
  } catch {
    return sse.error('Invalid userData JSON');
  }

  if (!userData) {
    return sse.error('User data is required');
  }

  sse.progress('starting', 10, 'Starting form fill...');

  const { toFile } = await import('reductoai');
  const Reducto = (await import('reductoai')).default;
  const client = new Reducto({ apiKey: process.env.REDUCTO_API_KEY });

  sse.progress('uploading', 20, 'Uploading form...');

  const file = await toFile(req.file.buffer, req.file.originalname);
  const uploadResponse = await client.upload({ file });
  const documentUrl = uploadResponse.url || `reducto://${uploadResponse.file_id}`;

  sse.progress('analyzing', 40, 'Analyzing form structure...');

  // Build fill instructions from user data
  const instructions = Object.entries(userData)
    .filter(([_, value]) => value != null && value !== '')
    .map(([field, value]) => `${field}: ${value}`)
    .join('\n');

  sse.progress('filling', 60, 'Filling form fields...');

  const result = await client.edit.run({
    document_url: documentUrl,
    edit_instructions: `Fill this form with:\n${instructions}`,
  });

  sse.progress('finalizing', 90, 'Generating filled document...');

  sse.complete({
    filledFormUrl: result.document_url,
    formSchema: result.form_schema,
    usage: result.usage,
  });
}));

export default router;
