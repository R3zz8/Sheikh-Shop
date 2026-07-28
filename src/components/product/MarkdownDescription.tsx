'use client';

import React, { useState, useEffect } from 'react';
import { renderMarkdownDescription } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface MarkdownDescriptionProps {
  content: string | null | undefined;
  className?: string;
}

/**
 * Renders product description with Markdown/HTML support
 * Sanitizes HTML using DOMPurify and allows only safe formatting tags
 */
export default function MarkdownDescription({ content, className }: MarkdownDescriptionProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');

  useEffect(() => {
    if (content) {
      const rawHtml = renderMarkdownDescription(content);
      if (typeof window !== 'undefined') {
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          ALLOWED_TAGS: [
            'p', 'strong', 'em', 'u', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'code', 'pre'
          ],
          ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class']
        });
        setSanitizedHtml(cleanHtml);
      }
    }
  }, [content]);

  if (!content) {
    return (
      <p className={cn('text-stone-400 text-sm', className)}>
        توضیحی برای این محصول ثبت نشده است.
      </p>
    );
  }

  // Fallback to basic sanitized HTML during SSR to avoid empty screen before hydration
  const initialHtml = renderMarkdownDescription(content);

  return (
    <div
      className={cn(
        'prose prose-invert prose-amber max-w-none',
        'prose-headings:text-stone-100 prose-headings:font-bold prose-headings:mb-4',
        'prose-p:text-stone-300 prose-p:leading-relaxed prose-p:mb-4 text-justify text-sm md:text-base',
        'prose-strong:text-amber-400 prose-strong:font-bold',
        'prose-em:text-amber-200',
        'prose-ul:text-stone-300 prose-ol:text-stone-300 prose-ul:list-disc prose-ul:pl-0 prose-ul:pr-5 prose-ul:mb-4',
        'prose-li:text-stone-300 prose-li:mb-2',
        'prose-a:text-amber-400 prose-a:underline hover:prose-a:text-amber-300 transition-colors',
        'prose-blockquote:border-r-4 prose-blockquote:border-l-0 prose-blockquote:border-amber-500 prose-blockquote:pr-4 prose-blockquote:pl-0 prose-blockquote:text-stone-400 prose-blockquote:italic prose-blockquote:my-6',
        'prose-code:text-amber-300 prose-code:bg-stone-900/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
        'prose-pre:bg-stone-950/80 prose-pre:text-stone-300 prose-pre:p-4 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:border prose-pre:border-stone-800/50',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml || initialHtml }}
    />
  );
}
