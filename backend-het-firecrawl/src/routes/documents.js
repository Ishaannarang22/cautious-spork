import express from 'express';
import multer from 'multer';
import reducto from '../services/reducto.js';
import * as formSelector from '../services/formSelector.js';
import { formCatalog, getFormById } from '../config/formCatalog.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
});

/**
 * POST /api/documents/upload
 * Upload a document for processing
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await reducto.uploadFile(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      data: {
        fileId: result.file_id,
        url: result.url, // reducto:// prefixed URL
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload document',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/parse
 * Parse a document and extract all content
 *
 * Body:
 * - input: string (URL or reducto:// reference) | required
 * - options: object | optional
 *   - tableFormat: 'json' | 'html' | 'markdown' | 'csv'
 *   - enhance: { tables: boolean, figures: boolean }
 */
router.post('/parse', async (req, res) => {
  try {
    const { input, options = {} } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    const result = await reducto.parseDocument(input, options);

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        duration: result.duration,
        pdfUrl: result.pdf_url,
        studioLink: result.studio_link,
        usage: result.usage,
        result: result.result,
      },
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({
      error: 'Failed to parse document',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/parse-file
 * Upload and parse a document in one step
 */
router.post('/parse-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Parsing file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse directly from file buffer
    const result = await reducto.parseFile(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        duration: result.duration,
        pdfUrl: result.pdf_url,
        studioLink: result.studio_link,
        usage: result.usage,
        result: result.result,
        file: {
          filename: req.file.originalname,
        },
      },
    });
  } catch (error) {
    console.error('Parse file error:', error);
    res.status(500).json({
      error: 'Failed to parse document',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/extract
 * Extract structured data from a document using a schema
 *
 * Body:
 * - input: string (URL or reducto:// reference) | required
 * - schema: object (JSON schema) | required
 * - options: object | optional
 *   - systemPrompt: string
 *   - citations: boolean
 */
router.post('/extract', async (req, res) => {
  try {
    const { input, schema, options = {} } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    if (!schema) {
      return res.status(400).json({ error: 'Extraction schema is required' });
    }

    const result = await reducto.extractFromDocument(input, schema, options);

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        studioLink: result.studio_link,
        usage: result.usage,
        result: result.result,
      },
    });
  } catch (error) {
    console.error('Extract error:', error);
    res.status(500).json({
      error: 'Failed to extract data from document',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/extract-file
 * Upload and extract structured data in one step
 */
router.post('/extract-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const schema = req.body.schema ? JSON.parse(req.body.schema) : null;
    if (!schema) {
      return res.status(400).json({ error: 'Extraction schema is required' });
    }

    console.log(`Extracting from file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Extract directly from file buffer
    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const result = await reducto.extractFromFile(req.file.buffer, req.file.originalname, schema, options);

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        studioLink: result.studio_link,
        usage: result.usage,
        result: result.result,
        file: {
          filename: req.file.originalname,
        },
      },
    });
  } catch (error) {
    console.error('Extract file error:', error);
    res.status(500).json({
      error: 'Failed to extract data from document',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/extract/personal-info
 * Extract personal information from a document using pre-defined schema
 */
router.post('/extract/personal-info', async (req, res) => {
  try {
    const { input, options = {} } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    const result = await reducto.extractFromDocument(
      input,
      reducto.schemas.personalInfo,
      {
        systemPrompt: 'Extract personal information from this document. Only include information that is clearly visible.',
        ...options,
      }
    );

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        usage: result.usage,
        result: result.result,
      },
    });
  } catch (error) {
    console.error('Extract personal info error:', error);
    res.status(500).json({
      error: 'Failed to extract personal information',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/extract/financial-info
 * Extract financial information from a document using pre-defined schema
 */
router.post('/extract/financial-info', async (req, res) => {
  try {
    const { input, options = {} } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    const result = await reducto.extractFromDocument(
      input,
      reducto.schemas.financialInfo,
      {
        systemPrompt: 'Extract financial information from this document. Include all transactions and account details visible.',
        ...options,
      }
    );

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        usage: result.usage,
        result: result.result,
      },
    });
  } catch (error) {
    console.error('Extract financial info error:', error);
    res.status(500).json({
      error: 'Failed to extract financial information',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/extract/employment-info
 * Extract employment information from a document using pre-defined schema
 */
router.post('/extract/employment-info', async (req, res) => {
  try {
    const { input, options = {} } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    const result = await reducto.extractFromDocument(
      input,
      reducto.schemas.employmentInfo,
      {
        systemPrompt: 'Extract employment information from this document. Include employer details, job title, and compensation information.',
        ...options,
      }
    );

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        usage: result.usage,
        result: result.result,
      },
    });
  } catch (error) {
    console.error('Extract employment info error:', error);
    res.status(500).json({
      error: 'Failed to extract employment information',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/extract/claim-info
 * Extract claim-relevant information from a document using pre-defined schema
 */
router.post('/extract/claim-info', async (req, res) => {
  try {
    const { input, options = {} } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    const result = await reducto.extractFromDocument(
      input,
      reducto.schemas.claimInfo,
      {
        systemPrompt: 'Extract claim-relevant information from this document. Focus on claim type, companies involved, deadlines, and eligibility criteria.',
        ...options,
      }
    );

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        usage: result.usage,
        result: result.result,
      },
    });
  } catch (error) {
    console.error('Extract claim info error:', error);
    res.status(500).json({
      error: 'Failed to extract claim information',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/extract/identity
 * Extract identity document information using pre-defined schema
 */
router.post('/extract/identity', async (req, res) => {
  try {
    const { input, options = {} } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    const result = await reducto.extractFromDocument(
      input,
      reducto.schemas.identityDocument,
      {
        systemPrompt: 'Extract information from this identity document. Include document type, number, dates, and personal details.',
        ...options,
      }
    );

    res.json({
      success: true,
      data: {
        jobId: result.job_id,
        usage: result.usage,
        result: result.result,
      },
    });
  } catch (error) {
    console.error('Extract identity error:', error);
    res.status(500).json({
      error: 'Failed to extract identity document information',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/split
 * Split a document into sections based on descriptions
 *
 * Body:
 * - input: string (URL or reducto:// reference) | required
 * - sections: string[] (descriptions of sections to split by) | required
 */
router.post('/split', async (req, res) => {
  try {
    const { input, sections } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'Section descriptions array is required' });
    }

    const result = await reducto.splitDocument(input, sections);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Split error:', error);
    res.status(500).json({
      error: 'Failed to split document',
      message: error.message,
    });
  }
});

/**
 * GET /api/documents/job/:jobId
 * Get the status of an async job
 */
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const result = await reducto.getJobStatus(jobId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({
      error: 'Failed to get job status',
      message: error.message,
    });
  }
});

/**
 * GET /api/documents/schemas
 * Get available pre-defined extraction schemas
 */
router.get('/schemas', (_req, res) => {
  res.json({
    success: true,
    data: {
      personalInfo: {
        name: 'Personal Information',
        description: 'Extract personal details like name, email, phone, address, DOB',
        schema: reducto.schemas.personalInfo,
      },
      financialInfo: {
        name: 'Financial Information',
        description: 'Extract account details, transactions, and balances',
        schema: reducto.schemas.financialInfo,
      },
      employmentInfo: {
        name: 'Employment Information',
        description: 'Extract employer details, job title, salary, and dates',
        schema: reducto.schemas.employmentInfo,
      },
      claimInfo: {
        name: 'Claim Information',
        description: 'Extract claim type, involved parties, deadlines, and eligibility',
        schema: reducto.schemas.claimInfo,
      },
      identityDocument: {
        name: 'Identity Document',
        description: 'Extract ID document details like type, number, and dates',
        schema: reducto.schemas.identityDocument,
      },
    },
  });
});

// ============================================
// FORM FILLING ENDPOINTS
// ============================================

import { withSSE } from '../utils/sse.js';

/**
 * POST /api/documents/forms/detect
 * Detect form fields in a PDF document
 *
 * Body:
 * - input: string (URL or reducto:// reference) | required
 */
router.post('/forms/detect', async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    const result = await reducto.detectFormFields(input);

    res.json({
      success: true,
      data: {
        documentUrl: result.document_url,
        formSchema: result.form_schema,
        usage: result.usage,
      },
    });
  } catch (error) {
    console.error('Form detect error:', error);
    res.status(500).json({
      error: 'Failed to detect form fields',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/forms/detect-file
 * Upload a PDF and detect its form fields
 */
router.post('/forms/detect-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Detecting form fields in: ${req.file.originalname}`);

    const result = await reducto.detectFormFieldsFromFile(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      data: {
        documentUrl: result.document_url,
        formSchema: result.form_schema,
        usage: result.usage,
        file: {
          filename: req.file.originalname,
        },
      },
    });
  } catch (error) {
    console.error('Form detect file error:', error);
    res.status(500).json({
      error: 'Failed to detect form fields',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/forms/fill
 * Fill a PDF form using natural language instructions
 *
 * Body:
 * - input: string (URL or reducto:// reference) | required
 * - instructions: string (natural language fill instructions) | required
 * - formSchema: array (optional - pre-detected form fields with values)
 * - editOptions: object (optional - color, provider preferences)
 */
router.post('/forms/fill', async (req, res) => {
  try {
    const { input, instructions, formSchema, editOptions } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    if (!instructions) {
      return res.status(400).json({ error: 'Fill instructions are required' });
    }

    const result = await reducto.editDocument(input, instructions, {
      formSchema,
      editOptions,
    });

    res.json({
      success: true,
      data: {
        documentUrl: result.document_url,
        formSchema: result.form_schema,
        usage: result.usage,
      },
    });
  } catch (error) {
    console.error('Form fill error:', error);

    // Check for specific error about no form fields
    const errorMsg = error.message || '';
    if (errorMsg.includes('No form fields detected')) {
      return res.status(400).json({
        error: 'Not a fillable PDF',
        message: 'This PDF does not contain fillable form fields. Please use a PDF form with text boxes, checkboxes, or other form elements.',
      });
    }

    res.status(500).json({
      error: 'Failed to fill form',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/forms/fill-file
 * Upload a PDF form and fill it using natural language instructions
 */
router.post('/forms/fill-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const instructions = req.body.instructions;
    if (!instructions) {
      return res.status(400).json({ error: 'Fill instructions are required' });
    }

    console.log(`Filling form: ${req.file.originalname}`);

    const formSchema = req.body.formSchema ? JSON.parse(req.body.formSchema) : undefined;
    const editOptions = req.body.editOptions ? JSON.parse(req.body.editOptions) : undefined;

    const result = await reducto.editFile(req.file.buffer, req.file.originalname, instructions, {
      formSchema,
      editOptions,
    });

    res.json({
      success: true,
      data: {
        documentUrl: result.document_url,
        formSchema: result.form_schema,
        usage: result.usage,
        file: {
          filename: req.file.originalname,
        },
      },
    });
  } catch (error) {
    console.error('Form fill file error:', error);
    res.status(500).json({
      error: 'Failed to fill form',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/forms/fill-with-data
 * Fill a PDF form with structured data (key-value pairs)
 *
 * Body:
 * - input: string (URL or reducto:// reference) | required
 * - data: object (key-value pairs to fill) | required
 */
router.post('/forms/fill-with-data', async (req, res) => {
  try {
    const { input, data } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input URL or file reference is required' });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Form data object is required' });
    }

    // Convert data object to natural language instructions
    const instructions = Object.entries(data)
      .map(([field, value]) => `Set "${field}" to "${value}"`)
      .join('. ');

    const result = await reducto.editDocument(input, instructions);

    res.json({
      success: true,
      data: {
        documentUrl: result.document_url,
        formSchema: result.form_schema,
        usage: result.usage,
      },
    });
  } catch (error) {
    console.error('Form fill with data error:', error);
    res.status(500).json({
      error: 'Failed to fill form',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/forms/fill-file-with-data
 * Upload a PDF form and fill it with structured data
 */
router.post('/forms/fill-file-with-data', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = req.body.data ? JSON.parse(req.body.data) : null;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Form data object is required' });
    }

    console.log(`Filling form with data: ${req.file.originalname}`);

    // Convert data object to natural language instructions
    const instructions = Object.entries(data)
      .map(([field, value]) => `Set "${field}" to "${value}"`)
      .join('. ');

    const result = await reducto.editFile(req.file.buffer, req.file.originalname, instructions);

    res.json({
      success: true,
      data: {
        documentUrl: result.document_url,
        formSchema: result.form_schema,
        usage: result.usage,
        file: {
          filename: req.file.originalname,
        },
      },
    });
  } catch (error) {
    console.error('Form fill file with data error:', error);
    res.status(500).json({
      error: 'Failed to fill form',
      message: error.message,
    });
  }
});

// ============================================
// SSE FORM FILLING ENDPOINTS (with live progress)
// ============================================

/**
 * POST /api/documents/forms/fill-file-sse
 * Fill a PDF form with SSE progress updates
 */
router.post('/forms/fill-file-sse', upload.single('file'), withSSE(async (req, res, sse) => {
  if (!req.file) {
    return sse.error('No file uploaded');
  }

  const instructions = req.body.instructions;
  if (!instructions) {
    return sse.error('Fill instructions are required');
  }

  try {
    sse.progress('uploading', 10, 'Uploading PDF form...');

    const { toFile } = await import('reductoai');
    const file = await toFile(req.file.buffer, req.file.originalname);

    sse.progress('uploading', 25, 'File uploaded, preparing...');

    const Reducto = (await import('reductoai')).default;
    const client = new Reducto({ apiKey: process.env.REDUCTO_API_KEY });

    const uploadResponse = await client.upload({ file });
    const documentUrl = uploadResponse.url || `reducto://${uploadResponse.file_id}`;

    sse.progress('analyzing', 35, 'Analyzing form structure...');

    sse.progress('filling', 50, 'Filling form fields (this may take 30-60 seconds)...');

    const result = await client.edit.run({
      document_url: documentUrl,
      edit_instructions: instructions,
    });

    sse.progress('finalizing', 90, 'Generating filled PDF...');

    sse.complete({
      documentUrl: result.document_url,
      formSchema: result.form_schema,
      usage: result.usage,
    });

  } catch (error) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('No form fields detected')) {
      sse.error('This PDF does not contain fillable form fields. Please use a PDF form with text boxes, checkboxes, or other form elements.');
    } else {
      sse.error(error.message);
    }
  }
}));

/**
 * POST /api/documents/forms/fill-file-with-data-sse
 * Fill a PDF form with structured data and SSE progress
 */
router.post('/forms/fill-file-with-data-sse', upload.single('file'), withSSE(async (req, res, sse) => {
  if (!req.file) {
    return sse.error('No file uploaded');
  }

  let data;
  try {
    data = req.body.data ? JSON.parse(req.body.data) : null;
  } catch {
    return sse.error('Invalid JSON data');
  }

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return sse.error('Form data is required');
  }

  try {
    sse.progress('uploading', 10, 'Uploading PDF form...');

    const { toFile } = await import('reductoai');
    const file = await toFile(req.file.buffer, req.file.originalname);

    sse.progress('uploading', 25, 'File uploaded successfully');

    const Reducto = (await import('reductoai')).default;
    const client = new Reducto({ apiKey: process.env.REDUCTO_API_KEY });

    const uploadResponse = await client.upload({ file });
    const documentUrl = uploadResponse.url || `reducto://${uploadResponse.file_id}`;

    sse.progress('preparing', 35, 'Preparing fill instructions...');

    // Convert data object to natural language instructions
    const instructions = Object.entries(data)
      .map(([field, value]) => `Set "${field}" to "${value}"`)
      .join('. ');

    sse.progress('filling', 50, `Filling ${Object.keys(data).length} fields (this may take 30-60 seconds)...`);

    const result = await client.edit.run({
      document_url: documentUrl,
      edit_instructions: instructions,
    });

    sse.progress('finalizing', 95, 'Generating filled PDF...');

    sse.complete({
      documentUrl: result.document_url,
      formSchema: result.form_schema,
      usage: result.usage,
      fieldsFilledCount: Object.keys(data).length,
    });

  } catch (error) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('No form fields detected')) {
      sse.error('This PDF does not contain fillable form fields. Please use a PDF form with text boxes, checkboxes, or other form elements.');
    } else {
      sse.error(error.message);
    }
  }
}));

// ============================================
// LLM-BASED FORM SELECTION ENDPOINTS
// ============================================

/**
 * GET /api/documents/forms/catalog
 * Get all available form templates with their metadata
 */
router.get('/forms/catalog', async (_req, res) => {
  try {
    const forms = await formSelector.listAvailableForms();
    res.json({
      success: true,
      data: {
        forms,
        totalForms: forms.length,
        availableForms: forms.filter(f => f.fileAvailable).length,
      },
    });
  } catch (error) {
    console.error('Form catalog error:', error);
    res.status(500).json({
      error: 'Failed to get form catalog',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/forms/select
 * Use LLM to select the best form based on user's situation
 *
 * Body:
 * - description: string (natural language description of situation) | required
 * - claimType: string (optional hint for claim type)
 * - userData: object (optional - any user data that might help selection)
 */
router.post('/forms/select', async (req, res) => {
  try {
    const { description, claimType, userData } = req.body;

    if (!description) {
      return res.status(400).json({
        error: 'Description is required',
        message: 'Please describe your situation so we can find the best form',
      });
    }

    const result = await formSelector.selectBestForm({
      description,
      claimType,
      userData,
    });

    res.json({
      success: true,
      data: {
        selectedForm: {
          id: result.selectedForm.id,
          name: result.selectedForm.name,
          description: result.selectedForm.description,
          requiredFields: result.selectedForm.requiredFields,
          optionalFields: result.selectedForm.optionalFields,
        },
        confidence: result.confidence,
        reasoning: result.reasoning,
        alternativeForms: result.alternativeForms.map(f => ({
          id: f.id,
          name: f.name,
          description: f.description,
        })),
        missingInfo: result.missingInfo,
      },
    });
  } catch (error) {
    console.error('Form select error:', error);
    res.status(500).json({
      error: 'Failed to select form',
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/forms/auto-fill
 * LLM selects best form + fills it with user data (with SSE progress)
 *
 * Body (JSON or form-data):
 * - description: string (situation description for form selection) | required
 * - userData: object (data to fill the form with) | required
 * - claimType: string (optional hint)
 */
router.post('/forms/auto-fill', express.json(), withSSE(async (req, res, sse) => {
  const { description, userData, claimType } = req.body;

  if (!description) {
    return sse.error('Please describe your situation so we can find the best form');
  }

  if (!userData || typeof userData !== 'object' || Object.keys(userData).length === 0) {
    return sse.error('User data is required to fill the form');
  }

  try {
    sse.progress('analyzing', 10, 'Analyzing your situation...');

    // Step 1: LLM selects the best form
    const selection = await formSelector.selectBestForm({
      description,
      claimType,
      userData,
    });

    sse.progress('selected', 25, `Selected form: ${selection.selectedForm.name}`);

    // Step 2: Check if the form PDF exists
    const formExists = await formSelector.formFileExists(selection.selectedForm.id);
    if (!formExists) {
      return sse.error(`Form template "${selection.selectedForm.name}" is not available. Please upload the PDF template to the forms directory.`);
    }

    sse.progress('loading', 35, 'Loading form template...');

    // Step 3: Load the form PDF
    const formBuffer = await formSelector.getFormFileBuffer(selection.selectedForm.id);
    const formFilename = selection.selectedForm.filename;

    sse.progress('uploading', 45, 'Uploading form to processor...');

    // Step 4: Upload to Reducto
    const { toFile } = await import('reductoai');
    const file = await toFile(formBuffer, formFilename);

    const Reducto = (await import('reductoai')).default;
    const client = new Reducto({ apiKey: process.env.REDUCTO_API_KEY });

    const uploadResponse = await client.upload({ file });
    const documentUrl = uploadResponse.url || `reducto://${uploadResponse.file_id}`;

    sse.progress('preparing', 55, 'Preparing fill instructions...');

    // Step 5: Build fill instructions from userData
    // Map user data fields to form fields intelligently
    const fieldMappings = buildFieldMappings(userData, selection.selectedForm);
    const instructions = Object.entries(fieldMappings)
      .map(([field, value]) => `Set "${field}" to "${value}"`)
      .join('. ');

    sse.progress('filling', 65, `Filling ${Object.keys(fieldMappings).length} fields (this may take 30-60 seconds)...`);

    // Step 6: Fill the form
    const result = await client.edit.run({
      document_url: documentUrl,
      edit_instructions: instructions,
    });

    sse.progress('finalizing', 95, 'Generating filled PDF...');

    // Step 7: Return result
    sse.complete({
      selectedForm: {
        id: selection.selectedForm.id,
        name: selection.selectedForm.name,
      },
      selectionReasoning: selection.reasoning,
      confidence: selection.confidence,
      documentUrl: result.document_url,
      formSchema: result.form_schema,
      usage: result.usage,
      fieldsFilledCount: Object.keys(fieldMappings).length,
      alternativeForms: selection.alternativeForms.map(f => ({ id: f.id, name: f.name })),
    });

  } catch (error) {
    console.error('Auto-fill error:', error);
    sse.error(error.message);
  }
}));

/**
 * Helper: Map user data fields to form fields
 * Handles common field name variations
 */
function buildFieldMappings(userData, form) {
  const mappings = {};

  // Common field mappings
  const fieldAliases = {
    fullName: ['name', 'fullName', 'full_name', 'Full Name', 'applicantName', 'claimantName'],
    email: ['email', 'Email', 'emailAddress', 'email_address', 'e-mail'],
    phone: ['phone', 'Phone', 'phoneNumber', 'phone_number', 'telephone', 'tel'],
    address: ['address', 'Address', 'streetAddress', 'street_address', 'homeAddress'],
    city: ['city', 'City'],
    state: ['state', 'State', 'province'],
    zipCode: ['zipCode', 'zip_code', 'zip', 'postalCode', 'postal_code'],
    dateOfBirth: ['dateOfBirth', 'dob', 'DOB', 'birthDate', 'birth_date', 'Date of Birth'],
    ssn: ['ssn', 'SSN', 'socialSecurity', 'social_security'],
    date: ['date', 'Date', 'currentDate', 'signatureDate', 'today'],
    signature: ['signature', 'Signature', 'signatureName'],
  };

  // First, add all user data directly
  for (const [key, value] of Object.entries(userData)) {
    if (value !== null && value !== undefined && value !== '') {
      mappings[key] = value;
    }
  }

  // Then try to map common aliases if the form expects them
  for (const [formField, aliases] of Object.entries(fieldAliases)) {
    // Check if any alias exists in userData
    for (const alias of aliases) {
      if (userData[alias] && !mappings[formField]) {
        mappings[formField] = userData[alias];
        break;
      }
    }
  }

  return mappings;
}

/**
 * GET /api/documents/forms/template/:formId
 * Download a form template PDF
 */
router.get('/forms/template/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const form = getFormById(formId);

    if (!form) {
      return res.status(404).json({
        error: 'Form not found',
        message: `No form with ID "${formId}" exists in the catalog`,
      });
    }

    const exists = await formSelector.formFileExists(formId);
    if (!exists) {
      return res.status(404).json({
        error: 'Form template not available',
        message: `The PDF template for "${form.name}" has not been uploaded yet`,
      });
    }

    const buffer = await formSelector.getFormFileBuffer(formId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${form.filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Form template download error:', error);
    res.status(500).json({
      error: 'Failed to download form template',
      message: error.message,
    });
  }
});

export default router;
