export const metadata = {
	title: 'FAQ - Sheikh Shop',
	description: 'Frequently asked questions about shipping, payment, and returns.'
};

import FAQSchema from '@/components/seo/FAQSchema';

export default function FAQPage() {
	const faqs = [
		{ question: 'Do you ship internationally?', answer: 'Yes, we ship worldwide with tracked delivery.' },
		{ question: 'What is your return policy?', answer: 'Returns are accepted within 14 days for unopened items.' },
		{ question: 'How can I contact support?', answer: 'Email us at sheikhshops.com@gmail.com.' },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950">
			<div className="container mx-auto max-w-3xl px-6 py-12">
				<h1 className="text-3xl md:text-4xl font-serif text-amber-200 mb-6">Frequently Asked Questions</h1>
				<div className="space-y-4 text-amber-100/90">
					{faqs.map((f, i) => (
						<div key={i} className="rounded-lg border border-amber-800/40 bg-black/20 p-4">
							<p className="font-semibold text-amber-300">{f.question}</p>
							<p className="mt-1 text-sm">{f.answer}</p>
						</div>
					))}
				</div>
				<FAQSchema faqs={faqs} />
			</div>
		</div>
	);
}
