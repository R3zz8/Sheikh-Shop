import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EnhancedArticleForm from '../../_components/EnhancedArticleForm';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedArticleForm />
    </div>
  );
} 