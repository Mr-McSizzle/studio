export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

/**
 * Wraps an async AI function with exponential backoff retry logic.
 * Specifically detects rate limits (429) and waits before retrying.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }

      const errorMessage = error?.message || '';
      
      // Check for rate limit explicitly
      if (errorMessage.includes('429 Too Many Requests')) {
        // Try to parse the retry delay suggested by Groq's API
        const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
        let delayMs = baseDelayMs * Math.pow(2, attempt);
        
        if (retryMatch && retryMatch[1]) {
          const suggestedDelaySecs = parseFloat(retryMatch[1]);
          if (!isNaN(suggestedDelaySecs)) {
            // Add a small buffer to the suggested delay
            delayMs = (suggestedDelaySecs * 1000) + 1000;
          }
        }
        
        if (delayMs > 10000) {
          console.warn(`[AI Retry] Rate limit delay (${delayMs}ms) is too long for UI. Aborting retry and failing fast.`);
          throw new Error("Groq API Rate Limit Exceeded. Please try again later.");
        }
        
        console.warn(`[AI Retry] Rate limited. Retrying attempt ${attempt} in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // For 503 Service Unavailable or network issues
      if (
        errorMessage.includes('503 Service Unavailable') || 
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('ECONNRESET')
      ) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[AI Retry] Service unavailable/Network error. Retrying attempt ${attempt} in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      // If it's not a retryable error, throw immediately
      throw error;
    }
  }
  
  throw new Error("Max retries exceeded"); // Should not be reached
}

/**
 * Sanitizes a raw AI/API error message into a user-friendly string.
 */
export function sanitizeAiError(error: any): string {
  const msg = error?.message || String(error);
  
  if (msg.includes('429 Too Many Requests') || msg.includes('quota')) {
    return "The AI service is currently experiencing high demand and rate limits. Please wait a moment and try again.";
  }
  
  if (msg.includes('503 Service Unavailable') || msg.includes('overloaded')) {
    return "The AI service is temporarily unavailable or overloaded. Please try again later.";
  }
  
  if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
    return "There is an issue with the AI service configuration (Invalid API Key).";
  }
  
  if (msg.includes('fetch failed') || msg.includes('NetworkError') || msg.includes('ECONNRESET')) {
    return "A network error occurred while connecting to the AI service. Please check your internet connection.";
  }
  
  if (msg.includes('JSON')) {
    return "The AI returned an invalid or malformed response. Please try again.";
  }

  // Fallback for unknown errors (avoids showing raw stack traces)
  return "An unexpected error occurred while communicating with the AI service. Please try again.";
}

/**
 * Robustly parses JSON strings that might be returned by an LLM.
 * Handles trailing commas, markdown code blocks, and minor formatting issues.
 */
export function safeJsonParse<T = any>(jsonString: string): T {
  try {
    // First, try standard parse
    return JSON.parse(jsonString) as T;
  } catch (e) {
    // If that fails, try to clean the string
    let cleanedString = jsonString;
    
    // Strip markdown formatting like ```json ... ```
    cleanedString = cleanedString.replace(/```(json)?/gi, '');
    cleanedString = cleanedString.trim();
    
    // Attempt to remove trailing commas before closing braces/brackets
    // This regex looks for a comma followed by whitespace and a closing bracket
    cleanedString = cleanedString.replace(/,\s*(?=[}\]])/g, '');
    
    try {
      return JSON.parse(cleanedString) as T;
    } catch (e2) {
      throw new Error("Failed to parse AI response as JSON even after sanitization");
    }
  }
}
