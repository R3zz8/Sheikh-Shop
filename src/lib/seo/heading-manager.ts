// src/lib/seo/heading-manager.ts

const MAX_HEADING_LENGTH = 70;

/**
 * Sanitizes a string to be used as a heading.
 * Removes HTML tags, trims whitespace, and truncates to a max length.
 * It also checks for and removes repeated keywords.
 * @param text The text to sanitize.
 * @returns The sanitized text.
 */
export function sanitizeHeading(text: string): string {
  if (!text) {
    return '';
  }

  // A simple regex to strip HTML tags.
  let sanitized = text.replace(/<[^>]*>?/gm, '');

  // Remove repeated keywords
  const words = sanitized.split(/\s+/);
  // FIXED: Replaced filter with reduce for more robust handling of consecutive duplicates.
  const uniqueWords = words.reduce((acc, currentWord) => {
    const lastWord = acc.length > 0 ? acc[acc.length - 1] : null;
    if (!lastWord || lastWord.toLowerCase() !== currentWord.toLowerCase()) {
      acc.push(currentWord);
    }
    return acc;
  }, [] as string[]);
  sanitized = uniqueWords.join(' ');

  // Truncate to max length
  if (sanitized.length > MAX_HEADING_LENGTH) {
    sanitized = sanitized.substring(0, MAX_HEADING_LENGTH) + '...';
  }

  return sanitized.trim();
}

/**
 * Rewrites a heading with a prefix or suffix to make it unique.
 * @param text The original heading text.
 * @param context The context to add (e.g., "Details", "Overview").
 * @param position Whether to add the context as a prefix or suffix.
 * @returns The rewritten heading.
 */
export function rewriteHeading(
  text: string,
  context: string,
  position: 'prefix' | 'suffix' = 'prefix'
): string {
  const sanitizedText = sanitizeHeading(text);
  if (position === 'prefix') {
    return `${context} - ${sanitizedText}`;
  }
  return `${sanitizedText} - ${context}`;
}

/**
 * Processes HTML content to enforce heading rules:
 * - Ensures exactly one H1 tag.
 * - Demotes duplicate H2/H3 tags.
 * - Can be configured to demote all headings by a certain level.
 *
 * @param htmlContent The HTML content to process.
 * @returns Processed HTML content.
 */
export function manageHeadings(htmlContent: string): string {
  if (!htmlContent) {
    return '';
  }

  let processedHtml = htmlContent;
  const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gi;
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;

  // Remove all existing H1 tags
  processedHtml = processedHtml.replace(h1Regex, '');

  // Add the main title as the single H1
  // Note: This function assumes the calling component will add the H1.
  // This function's main job is to clean up the content passed to dangerouslySetInnerHTML.

  // Track seen H2 and H3 tags to avoid duplicates
  const seenH2s = new Set<string>();
  const seenH3s = new Set<string>();

  // Process H2 tags
  processedHtml = processedHtml.replace(h2Regex, (match, content) => {
    const sanitizedContent = sanitizeHeading(content);
    if (seenH2s.has(sanitizedContent.toLowerCase())) {
      const rewrittenContent = rewriteHeading(content, 'Details');
      return `<h3 class="demoted-heading">${rewrittenContent}</h3>`; // Demote to H3
    }
    seenH2s.add(sanitizedContent.toLowerCase());
    return match; // Keep the original H2
  });

  // Process H3 tags
  processedHtml = processedHtml.replace(h3Regex, (match, content) => {
    const sanitizedContent = sanitizeHeading(content);
    if (seenH3s.has(sanitizedContent.toLowerCase())) {
      const rewrittenContent = rewriteHeading(content, 'More');
      return `<h4 class="demoted-heading">${rewrittenContent}</h4>`; // Demote to H4
    }
    seenH3s.add(sanitizedContent.toLowerCase());
    return match; // Keep the original H3
  });

  // Development-only logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Heading Manager] Processed content. Seen H2s:', seenH2s);
    console.log('[Heading Manager] Processed content. Seen H3s:', seenH3s);
  }

  return processedHtml;
}

interface Heading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

/**
 * Deduplicates a list of proposed headings for a page.
 * @param pageSlug Identifier for the page for logging purposes.
 * @param proposedHeadingList An array of heading objects.
 * @returns A sanitized list of heading objects.
 */
export function dedupeHeadings(
  pageSlug: string,
  proposedHeadingList: Heading[]
): Heading[] {
  const finalHeadings: Heading[] = [];
  let hasH1 = false;
  const seenH2s = new Set<string>();
  const seenH3s = new Set<string>();

  for (const heading of proposedHeadingList) {
    const sanitizedText = sanitizeHeading(heading.text).toLowerCase();

    if (heading.level === 1) {
      if (!hasH1) {
        finalHeadings.push(heading);
        hasH1 = true;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[Heading Manager] Multiple H1s proposed for slug "${pageSlug}". Demoting "${heading.text}" to H2.`
          );
        }
        finalHeadings.push({ ...heading, level: 2 });
      }
    } else if (heading.level === 2) {
      if (!seenH2s.has(sanitizedText)) {
        finalHeadings.push(heading);
        seenH2s.add(sanitizedText);
      } else {
        finalHeadings.push({ ...heading, text: rewriteHeading(heading.text, "Details") });
      }
    } else if (heading.level === 3) {
      if (!seenH3s.has(sanitizedText)) {
        finalHeadings.push(heading);
        seenH3s.add(sanitizedText);
      } else {
        finalHeadings.push({ ...heading, text: rewriteHeading(heading.text, "More") });
      }
    } else {
      finalHeadings.push(heading);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Heading Manager] Deduplicated headings for slug "${pageSlug}".`,
      finalHeadings
    );
  }

  return finalHeadings;
}
