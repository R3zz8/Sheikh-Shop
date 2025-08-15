import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ArticleForm from '../../_components/ArticleForm';

interface EditArticlePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const { id } = await params;

    const result = await prisma.article.findUnique({
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

    if (!result) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Article</h1>
            <ArticleForm article={{
                ...result,
                imageUrl: result.imageUrl ?? undefined,
            }} />
        </div>
    );
} 