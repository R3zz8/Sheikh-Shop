'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Unlink
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  tooltip: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

  // Save selection when text is selected
  const saveSelection = () => {
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (textarea) {
      setSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });
    }
  };

  // Restore selection
  const restoreSelection = () => {
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (textarea && selection) {
      textarea.setSelectionRange(selection.start, selection.end);
      textarea.focus();
    }
  };

  // Apply formatting
  const applyFormatting = (before: string, after: string) => {
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (start === end) {
      // No text selected, insert formatting at cursor
      const newValue = value.substring(0, start) + before + after + value.substring(start);
      onChange(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.setSelectionRange(start + before.length, start + before.length);
        textarea.focus();
      }, 0);
    } else {
      // Text selected, wrap with formatting
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
      onChange(newValue);
      
      // Restore selection
      setTimeout(() => {
        textarea.setSelectionRange(start, start + before.length + selectedText.length + after.length);
        textarea.focus();
      }, 0);
    }
  };

  // Toolbar actions
  const toolbarActions: ToolbarButton[] = [
    {
      icon: <Bold className="w-4 h-4" />,
      action: () => applyFormatting('**', '**'),
      tooltip: 'Bold (Ctrl+B)'
    },
    {
      icon: <Italic className="w-4 h-4" />,
      action: () => applyFormatting('*', '*'),
      tooltip: 'Italic (Ctrl+I)'
    },
    {
      icon: <Underline className="w-4 h-4" />,
      action: () => applyFormatting('<u>', '</u>'),
      tooltip: 'Underline'
    },
    {
      icon: <Heading1 className="w-4 h-4" />,
      action: () => applyFormatting('# ', ''),
      tooltip: 'Heading 1'
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      action: () => applyFormatting('## ', ''),
      tooltip: 'Heading 2'
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      action: () => applyFormatting('### ', ''),
      tooltip: 'Heading 3'
    },
    {
      icon: <List className="w-4 h-4" />,
      action: () => applyFormatting('- ', ''),
      tooltip: 'Bullet List'
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      action: () => applyFormatting('1. ', ''),
      tooltip: 'Numbered List'
    },
    {
      icon: <Quote className="w-4 h-4" />,
      action: () => applyFormatting('> ', ''),
      tooltip: 'Quote'
    },
    {
      icon: <Link className="w-4 h-4" />,
      action: () => setShowLinkDialog(true),
      tooltip: 'Insert Link'
    }
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormatting('**', '**');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('*', '*');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('<u>', '</u>');
          break;
      }
    }
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl && linkText) {
      const markdown = `[${linkText}](${linkUrl})`;
      applyFormatting('', markdown);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b">
        {toolbarActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => {
              saveSelection();
              action.action();
            }}
            className="h-8 w-8 p-0"
            title={action.tooltip}
          >
            {action.icon}
          </Button>
        ))}
      </div>

      {/* Editor */}
      <textarea
        id="rich-text-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onSelect={saveSelection}
        placeholder={placeholder || "Write your article content here..."}
        className="w-full min-h-[300px] p-4 resize-y border-0 focus:outline-none focus:ring-0 font-mono text-sm"
        style={{ fontFamily: 'inherit' }}
      />

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a link to your article content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text to display"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl || !linkText}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
