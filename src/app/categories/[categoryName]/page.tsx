import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CategoryProducts from './_components/CategoryProducts';

interface CategoryPageProps {
    params: {
        categoryName: string;
    };
}

// Map URL slugs to database enum values
const categoryMap: Record<string, string> = {
    'dates': 'DATES',
    'honey': 'HONEY',
    'saffron': 'SAFFRON',
    'other': 'OTHERS'
};

export async function generateStaticParams() {
    return [
        { categoryName: 'dates' },
        { categoryName: 'honey' },
        { categoryName: 'saffron' },
        { categoryName: 'other' }
    ];
}

export async function generateMetadata({ params }: CategoryPageProps) {
    const categoryName = params.categoryName;
    const categoryDisplayName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

    return {
        title: `${categoryDisplayName} Products - Sheikh Shop`,
        description: `Explore our premium collection of ${categoryDisplayName.toLowerCase()} products.`,
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { categoryName } = params;

    // Validate category name
    if (!categoryMap[categoryName]) {
        notFound();
    }

    const categoryEnum = categoryMap[categoryName];

    try {
        // Fetch products for this category
        const products = await prisma.product.findMany({
            where: {
                category: categoryEnum as any,
                status: 'ACTIVE'
            },
            include: {
                images: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const categoryDisplayName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

                <div className="relative z-10">
                    <CategoryProducts
                        products={products as any}
                        categoryName={categoryDisplayName}
                        categorySlug={categoryName}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error fetching category products:', error);
        notFound();
    }
} 