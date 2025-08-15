import ArticleForm from '../_components/ArticleForm';
import React from 'react';

export default function NewArticlePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
                <p className="text-gray-600 mt-2">Write and publish your next article</p>
            </div>
            <ArticleForm />
        </div>
    );
} 