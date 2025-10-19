import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import AIEnhancedArticleForm from '../../_components/AIEnhancedArticleForm';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  // Check authentication and permissions
  try {
    const userId = await getCurrentUserId();
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      redirect('/login');
    }

    // Check if user has permission to edit articles
    if (!['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(user.role)) {
      redirect('/dashboard');
    }
  } catch (error) {
    redirect('/login');
  }

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
        <p className="text-gray-600 mt-2">
          Edit "{article.title}" - Last updated: {new Date(article.updatedAt).toLocaleDateString()}
        </p>
      </div>
      
      <AIEnhancedArticleForm 
        mode="edit" 
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content: article.content,
          status: article.status as 'DRAFT' | 'PUBLISHED',
          imageUrl: article.imageUrl,
          category: article.category,
          tags: article.tags,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          keywords: article.keywords,
          internalLinks: article.internalLinks,
          externalLinks: article.externalLinks,
          excerpt: article.excerpt,
          language: article.language,
        }}
      />
    </div>
  );
} 