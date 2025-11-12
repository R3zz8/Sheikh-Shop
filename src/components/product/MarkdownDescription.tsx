'use client';

import { renderMarkdownDescription } from '@/lib/markdown';
import { cn } from '@/lib/utils';

interface MarkdownDescriptionProps {
  content: string | null | undefined;
  className?: string;
}

/**
 * Renders product description with Markdown/HTML support
 * Sanitizes HTML and allows only safe formatting tags
 */
export default function MarkdownDescription({ content, className }: MarkdownDescriptionProps) {
  if (!content) {
    return (
      <p className={cn('text-gray-300', className)}>
        No description available for this product.
      </p>
    );
  }

  const html = renderMarkdownDescription(content);

  return (
    <div
      className={cn(
        'prose prose-invert prose-amber max-w-none',
        'prose-headings:text-white prose-headings:font-semibold',
        'prose-p:text-gray-300 prose-p:leading-relaxed',
        'prose-strong:text-white prose-strong:font-semibold',
        'prose-em:text-amber-200',
        'prose-ul:text-gray-300 prose-ol:text-gray-300',
        'prose-li:text-gray-300',
        'prose-a:text-amber-400 prose-a:no-underline hover:prose-a:text-amber-300',
        'prose-blockquote:border-amber-400 prose-blockquote:text-gray-300',
        'prose-code:text-amber-300 prose-code:bg-amber-950/50',
        'prose-pre:bg-amber-950/50 prose-pre:text-gray-300',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}



