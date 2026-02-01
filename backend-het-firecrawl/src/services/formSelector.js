import Anthropic from '@anthropic-ai/sdk';
import { formCatalog, getFormCatalogSummary, getFormById } from '../config/formCatalog.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-initialize Anthropic client
let anthropicClient = null;

function getAnthropicClient() {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

/**
 * Use LLM to select the best form based on user's situation
 * @param {object} userContext - Information about the user's claim
 * @param {string} userContext.description - Natural language description of their situation
 * @param {string} userContext.claimType - Optional: specific claim type
 * @param {object} userContext.userData - Optional: structured user data
 * @returns {Promise<object>} Selected form info and reasoning
 */
export async function selectBestForm(userContext) {
  const catalogSummary = getFormCatalogSummary();

  const prompt = `You are a legal claims assistant. Based on the user's situation, select the most appropriate form from the available options.

AVAILABLE FORMS:
${JSON.stringify(catalogSummary, null, 2)}

USER'S SITUATION:
${userContext.description || 'Not provided'}

${userContext.claimType ? `CLAIM TYPE HINT: ${userContext.claimType}` : ''}

${userContext.userData ? `USER DATA PROVIDED:\n${JSON.stringify(userContext.userData, null, 2)}` : ''}

Analyze the user's situation and respond with a JSON object containing:
1. "selectedFormId": The ID of the best matching form
2. "confidence": Your confidence level (high/medium/low)
3. "reasoning": Brief explanation of why this form is the best fit
4. "alternativeForms": Array of other form IDs that might also work (if any)
5. "missingInfo": Array of information the user should provide for this form

Respond ONLY with valid JSON, no markdown or explanation.`;

  const response = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Parse the LLM response
  const responseText = response.content[0].text;
  let selection;

  try {
    selection = JSON.parse(responseText);
  } catch (e) {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      selection = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse LLM response as JSON');
    }
  }

  // Get the full form info
  const selectedForm = getFormById(selection.selectedFormId);

  if (!selectedForm) {
    throw new Error(`Selected form ID "${selection.selectedFormId}" not found in catalog`);
  }

  return {
    selectedForm,
    confidence: selection.confidence,
    reasoning: selection.reasoning,
    alternativeForms: selection.alternativeForms?.map(id => getFormById(id)).filter(Boolean) || [],
    missingInfo: selection.missingInfo || [],
  };
}

/**
 * Get the file path for a form's PDF
 * @param {string} formId - Form ID from catalog
 * @returns {string} Absolute path to the PDF file
 */
export function getFormFilePath(formId) {
  const form = getFormById(formId);
  if (!form) {
    throw new Error(`Form with ID "${formId}" not found`);
  }
  return path.join(__dirname, '..', 'forms', form.filename);
}

/**
 * Check if a form's PDF file exists
 * @param {string} formId - Form ID from catalog
 * @returns {Promise<boolean>} Whether the file exists
 */
export async function formFileExists(formId) {
  try {
    const filePath = getFormFilePath(formId);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get form file as buffer
 * @param {string} formId - Form ID from catalog
 * @returns {Promise<Buffer>} File buffer
 */
export async function getFormFileBuffer(formId) {
  const filePath = getFormFilePath(formId);
  return fs.readFile(filePath);
}

/**
 * List all available forms with their file status
 * @returns {Promise<Array>} Forms with availability status
 */
export async function listAvailableForms() {
  const results = [];

  for (const form of formCatalog) {
    const exists = await formFileExists(form.id);
    results.push({
      ...form,
      fileAvailable: exists,
    });
  }

  return results;
}

export default {
  selectBestForm,
  getFormFilePath,
  formFileExists,
  getFormFileBuffer,
  listAvailableForms,
};
