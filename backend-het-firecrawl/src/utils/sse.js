/**
 * SSE (Server-Sent Events) utility functions
 */

/**
 * Initialize SSE response headers
 * @param {Response} res - Express response object
 */
export function initSSE(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  res.flushHeaders();
}

/**
 * Send an SSE event
 * @param {Response} res - Express response object
 * @param {object} data - Event data
 * @param {string} data.step - Current step name
 * @param {number} data.progress - Progress percentage (0-100)
 * @param {string} data.message - Human-readable status message
 * @param {object} data.result - Result data (only on complete)
 * @param {string} data.error - Error message (only on error)
 */
export function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Send progress update
 * @param {Response} res - Express response object
 * @param {string} step - Step name
 * @param {number} progress - Progress percentage
 * @param {string} message - Status message
 */
export function sendProgress(res, step, progress, message) {
  sendSSE(res, { step, progress, message });
}

/**
 * Send completion event and close connection
 * @param {Response} res - Express response object
 * @param {object} result - Final result data
 */
export function sendComplete(res, result) {
  sendSSE(res, {
    step: 'complete',
    progress: 100,
    message: 'Processing complete',
    result,
  });
  res.end();
}

/**
 * Send error event and close connection
 * @param {Response} res - Express response object
 * @param {string} error - Error message
 */
export function sendError(res, error) {
  sendSSE(res, {
    step: 'error',
    progress: 0,
    message: 'Processing failed',
    error,
  });
  res.end();
}

/**
 * Create an SSE handler wrapper for async operations
 * @param {Function} handler - Async handler function that receives (req, res, sse)
 * @returns {Function} Express middleware
 */
export function withSSE(handler) {
  return async (req, res) => {
    initSSE(res);

    const sse = {
      progress: (step, progress, message) => sendProgress(res, step, progress, message),
      complete: (result) => sendComplete(res, result),
      error: (error) => sendError(res, error),
      send: (data) => sendSSE(res, data),
    };

    try {
      await handler(req, res, sse);
    } catch (error) {
      console.error('SSE handler error:', error);
      sse.error(error.message || 'An unexpected error occurred');
    }
  };
}

export default {
  initSSE,
  sendSSE,
  sendProgress,
  sendComplete,
  sendError,
  withSSE,
};
