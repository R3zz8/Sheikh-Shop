import { notFound, redirect } from 'next/navigation';
import { getProductByIdOrSlug } from '@/modules/products/services';

// This is a legacy ID-based route.
// We redirect all requests immediately to the modern SEO-friendly canonical route: /products/[slug]
// This guarantees a single canonical product detail path and eliminates duplicate pricing/layout logic.

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const data = await params;
    const { id } = data;

    const product = await getProductByIdOrSlug(id);

    if (!product) {
        return {
            title: 'Product Not Found | Sheikh Shop',
            description: 'The requested product could not be found.',
        };
    }

    // Server-side redirect inside generateMetadata is supported and triggers immediate redirection
    redirect(`/products/${product.slug || product.id}`);
}

async function page({ params }: { params: Promise<{ id: string }> }) {
    const data = await params;
    const { id } = data;

    const product = await getProductByIdOrSlug(id);

    if (!product) {
        notFound();
    }

    redirect(`/products/${product.slug || product.id}`);
}

export default page;
