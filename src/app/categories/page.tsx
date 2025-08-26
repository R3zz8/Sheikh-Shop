import Categories from '@/components/Categories';

export const metadata = {
    title: 'Product Categories - Sheikh Shop',
    description: 'Explore our premium collection of authentic products organized by categories.',
};

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

            <div className="relative z-10">
                <Categories />
            </div>
        </div>
    );
} 