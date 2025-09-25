import React from 'react';
import { generateFAQSchema } from '@/lib/seo/schema';

interface FAQItem {
	question: string;
	answer: string;
}

interface FAQSchemaProps {
	faqs: FAQItem[];
}

export default function FAQSchema({ faqs }: FAQSchemaProps) {
	const schema = generateFAQSchema(faqs);
	return (
		<script
			type="application/ld+json"
			suppressHydrationWarning
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}
