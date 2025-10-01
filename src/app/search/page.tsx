import EnhancedAISearch from '@/components/ai/EnhancedAISearch';

export const revalidate = 0;

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-white mb-4">Search</h1>
      <EnhancedAISearch className="max-w-3xl" />
    </div>
  );
}




