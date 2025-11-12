/**
 * Markdown Rendering Pipeline
 * Converts Markdown to HTML with safe sanitization
 * Allows only safe formatting tags: <p>, <strong>, <em>, <ul>, <li>, <h2>, <h3>, <blockquote>
 */

/**
 * Allowed HTML tags for product descriptions
 */
const ALLOWED_TAGS = [
  'p',
  'strong',
  'em',
  'u',
  'br',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'a',
  'code',
  'pre',
];

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  code: ['class'],
  pre: ['class'],
};

/**
 * Sanitize HTML by removing unsafe tags and attributes
 * Only allows safe formatting tags
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');

  // Simple tag allowlist implementation
  // This is a basic implementation - for production, consider using DOMPurify
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  
  sanitized = sanitized.replace(tagPattern, (match, tagName) => {
    const lowerTag = tagName.toLowerCase();
    
    // Allow closing tags for allowed tags
    if (match.startsWith('</')) {
      return ALLOWED_TAGS.includes(lowerTag) ? match : '';
    }
    
    // Allow opening tags for allowed tags
    if (ALLOWED_TAGS.includes(lowerTag)) {
      // Remove unsafe attributes
      let cleanTag = match;
      
      // Keep only allowed attributes
      const attrPattern = /(\w+)\s*=\s*["']([^"']*)["']/gi;
      const allowedAttrs = ALLOWED_ATTRIBUTES[lowerTag] || [];
      
      cleanTag = cleanTag.replace(attrPattern, (attrMatch, attrName, attrValue) => {
        if (allowedAttrs.includes(attrName.toLowerCase())) {
          // Additional safety for href
          if (attrName.toLowerCase() === 'href') {
            if (attrValue.startsWith('javascript:') || attrValue.startsWith('data:')) {
              return '';
            }
            // Add rel="noopener noreferrer" for external links
            if (attrValue.startsWith('http')) {
              return `${attrMatch} rel="noopener noreferrer"`;
            }
          }
          return attrMatch;
        }
        return '';
      });
      
      return cleanTag;
    }
    
    return '';
  });

  return sanitized.trim();
}

/**
 * Convert Markdown to HTML
 * Supports basic Markdown syntax
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, (match) => {
    if (!match.includes('<ul>')) {
      return '<ol>' + match + '</ol>';
    }
    return match;
  });

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<[^>]+>)/g, '$1');
  html = html.replace(/(<\/[^>]+>)<\/p>/g, '$1');

  return html;
}

/**
 * Render Markdown description to safe HTML
 * Combines markdown conversion and HTML sanitization
 */
export function renderMarkdownDescription(markdown: string | null | undefined): string {
  if (!markdown) return '';

  // Check if content is already HTML
  const hasHtmlTags = /<[^>]+>/.test(markdown);
  
  if (hasHtmlTags) {
    // If already HTML, just sanitize it
    return sanitizeHtml(markdown);
  }

  // Convert Markdown to HTML
  const html = markdownToHtml(markdown);
  
  // Sanitize the HTML
  return sanitizeHtml(html);
}

/**
 * Generate excerpt from description
 * Strips HTML/Markdown and returns plain text excerpt (160-240 chars)
 */
export function generateExcerpt(description: string | null | undefined, maxLength: number = 200): string {
  if (!description) return '';

  // Remove Markdown syntax
  let text = description
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/`([^`]+)`/g, '$1') // Code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/^[-*+]\s+/gm, '') // List items
    .replace(/^\d+\.\s+/gm, '') // Ordered list items
    .replace(/^>\s+/gm, '') // Blockquotes
    .replace(/\n+/g, ' ') // Newlines to spaces
    .trim();

  // Remove HTML tags if any
  text = text.replace(/<[^>]+>/g, '');

  // Truncate to maxLength
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim();
    // Try to cut at word boundary
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      text = text.substring(0, lastSpace);
    }
    text += '...';
  }

  return text;
}



