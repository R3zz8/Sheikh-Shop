const DANGEROUS_TAGS = ['script', 'style', 'iframe', 'object', 'embed'];
const DANGEROUS_ATTR = ['onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout'];
const SANITIZE_REGEX = new RegExp(
  `<(?<tag>/?(${DANGEROUS_TAGS.join('|')}))|(?<comment><!--)|(?<attr>${DANGEROUS_ATTR.join('|')})=|(?<url>href|src)=["']javascript:`,
  'gi'
);

/**
 * Removes dangerous HTML tags and attributes from a string.
 * @param html - The HTML string to sanitize.
 * @returns Sanitized HTML string.
 */
function safeStrip(html: string): string {
  return html.replace(SANITIZE_REGEX, '');
}

/**
 * Strips all HTML tags from a string.
 * @param html - The HTML string to strip.
 * @returns Plain text string.
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  // First, apply a basic level of sanitization to remove dangerous content
  const partiallySanitized = safeStrip(html);
  // Then, strip all remaining HTML tags
  return partiallySanitized.replace(/<[^>]*>?/gm, '');
}

/**
 * Sanitizes and truncates a description string.
 * @param text - The text to sanitize.
 * @param maxLength - The maximum length of the description.
 * @returns A sanitized and truncated string.
 */
export function sanitizeDescription(text: string, maxLength = 150): string {
  if (!text) return '';

  const sanitized = stripHtmlTags(text);
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  return sanitized.substring(0, maxLength).trim() + '...';
}

/**
 * Gets the first available SEO value from a list of fallbacks.
 * @param fallbacks - An array of potential values.
 * @returns The first non-empty value.
 */
export function getSEOValue(...fallbacks: (string | null | undefined)[]): string {
  return fallbacks.find((value) => typeof value === 'string' && value.trim()) || '';
}
