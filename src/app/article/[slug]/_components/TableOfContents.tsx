'use client';

import { useEffect, useState } from 'react';
import { Hash } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const items: TocItem[] = [];
    
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      const text = heading.textContent?.trim() || '';
      const level = parseInt(heading.tagName.charAt(1));
      
      // Add ID to the heading element in the DOM
      heading.id = id;
      
      items.push({ id, text, level });
    });
    
    setTocItems(items);

    // Set up intersection observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    // Observe all headings
    headings.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      observer.disconnect();
    };
  }, [content]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  if (tocItems.length === 0) {
    return (
      <div className="text-center py-8 font-vazirmatn" dir="rtl">
        <Hash className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-400 text-sm">هیچ تیتری یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="font-vazirmatn" dir="rtl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Hash className="w-5 h-5 text-amber-400" />
        فهرست مطالب
      </h3>
      <nav className="space-y-1">
        {tocItems.map((item, index) => {
          const paddingRight = (item.level - 1) * 16; // 16px per level
          
          return (
            <button
              key={index}
              onClick={() => scrollToHeading(item.id)}
              className={`block w-full text-right py-2 px-3 rounded-lg text-sm transition-colors duration-200 ${
                activeId === item.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              style={{ paddingRight: `${paddingRight + 12}px` }}
            >
              <span className="truncate block text-right">{item.text}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
