import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CategoryProducts from './_components/CategoryProducts';
import { generateCategoryMetadata } from '@/lib/seo/metadata';

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

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
    const data = await params;
    const categoryName = data.categoryName;
    return generateCategoryMetadata(categoryName);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const data = await params;
    const { categoryName } = data;

    try {
        // First try to find category by slug (new approach)
        let category = await prisma.category.findUnique({
            where: {
                slug: categoryName,
                isActive: true
            }
        });

        let products: any[] = [];
        let categoryDisplayName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        if (category) {
            // Use new category model approach
            products = await prisma.product.findMany({
                where: {
                    categoryId: category.id,
                    status: 'ACTIVE'
                },
                include: {
                    images: true,
                    units: true,
                    discounts: {
                        where: {
                            isActive: true,
                            startDate: { lte: new Date() },
                            endDate: { gte: new Date() }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            categoryDisplayName = category.name;
        } else if (categoryMap[categoryName]) {
            // Fallback to legacy enum approach
            const categoryEnum = categoryMap[categoryName];
            products = await prisma.product.findMany({
                where: {
                    category: categoryEnum as any,
                    status: 'ACTIVE'
                },
                include: {
                    images: true,
                    units: true,
                    discounts: {
                        where: {
                            isActive: true,
                            startDate: { lte: new Date() },
                            endDate: { gte: new Date() }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } else {
            notFound();
        }

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