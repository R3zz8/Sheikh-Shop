'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link, ExternalLink, Sparkles, Plus } from 'lucide-react';

interface InternalLinkSuggestion {
  url: string;
  title: string;
  type: 'article' | 'product' | 'category' | 'page';
  relevanceScore: number;
  reason: string;
}

interface SmartLinkSuggestion {
  text: string;
  suggestedLink: string;
  position: number;
  reason: string;
}

interface InternalLinkingSuggestionsProps {
  content: string;
  category?: string;
  tags?: string[];
  onAddLink: (url: string, title: string) => void;
}

export default function InternalLinkingSuggestions({
  content,
  category,
  tags,
  onAddLink
}: InternalLinkingSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<InternalLinkSuggestion[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartLinkSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'smart'>('suggestions');

  const generateSuggestions = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/articles/suggest-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          category,
          tags,
          type: 'suggestions'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuggestions(result.data);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartSuggestions = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/articles/suggest-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          category,
          tags,
          type: 'smart'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSmartSuggestions(result.data);
      }
    } catch (error) {
      console.error('Failed to generate smart suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <Link className="w-4 h-4 text-blue-500" />;
      case 'product':
        return <ExternalLink className="w-4 h-4 text-green-500" />;
      case 'category':
        return <Link className="w-4 h-4 text-purple-500" />;
      default:
        return <Link className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800';
      case 'product':
        return 'bg-green-100 text-green-800';
      case 'category':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!content.trim()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI-Powered Internal Linking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Start writing your article content to get intelligent internal linking suggestions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI-Powered Internal Linking
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'suggestions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('suggestions')}
          >
            General Suggestions
          </Button>
          <Button
            variant={activeTab === 'smart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('smart')}
          >
            Smart Positioning
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'suggestions' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Get relevant internal links based on your content
              </p>
              <Button
                onClick={generateSuggestions}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Suggested Links:</h4>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(suggestion.type)}
                        <span className="font-medium text-sm">{suggestion.title}</span>
                        <Badge className={`text-xs ${getTypeColor(suggestion.type)}`}>
                          {suggestion.type}
                        </Badge>
                        <span className={`text-xs ${getRelevanceColor(suggestion.relevanceScore)}`}>
                          {Math.round(suggestion.relevanceScore * 100)}% match
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{suggestion.reason}</p>
                      <p className="text-xs text-blue-600 mt-1">{suggestion.url}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onAddLink(suggestion.url, suggestion.title)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Find optimal positions to add internal links in your content
              </p>
              <Button
                onClick={generateSmartSuggestions}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Analyze
              </Button>
            </div>

            {smartSuggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Smart Link Positions:</h4>
                {smartSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm text-blue-900">
                        "{suggestion.text}"
                      </span>
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        Position: {suggestion.position}
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-700 mb-2">{suggestion.reason}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => onAddLink(suggestion.suggestedLink, suggestion.text)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Link
                      </Button>
                      <span className="text-xs text-blue-600">
                        {suggestion.suggestedLink}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && suggestions.length === 0 && smartSuggestions.length === 0 && content.trim() && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">
              Click "Generate" to get AI-powered internal linking suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
