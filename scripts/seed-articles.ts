import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArticles() {
    try {
        // Find a user with ADMIN or SUPERADMIN role to be the author
        const adminUser = await prisma.user.findFirst({
            where: {
                role: {
                    in: ['ADMIN', 'SUPERADMIN']
                }
            }
        });

        if (!adminUser) {
            console.log('No admin user found. Please create an admin user first.');
            return;
        }

        const articles = [
            {
                title: 'The Health Benefits of Honey',
                slug: 'health-benefits-of-honey',
                imageUrl: '/assets/mock/1.webp',
                summary: 'Discover the incredible antibacterial properties and digestive benefits of natural honey, along with its role in traditional medicine and modern wellness.',
                content: `
          <h2>The Ancient Sweetener with Modern Benefits</h2>
          <p>Honey has been used for thousands of years not just as a sweetener, but as a powerful natural medicine. Its unique composition makes it one of nature's most remarkable substances.</p>
          
          <h3>Antibacterial Properties</h3>
          <p>Raw honey contains natural antibacterial compounds that can help fight infections. The high sugar content creates an environment where bacteria cannot thrive, while enzymes produce hydrogen peroxide that acts as a natural antiseptic.</p>
          
          <h3>Digestive Health</h3>
          <p>Honey can soothe digestive issues and promote gut health. It contains prebiotics that feed beneficial bacteria in your digestive system, helping to maintain a healthy microbiome.</p>
          
          <h3>Natural Energy Source</h3>
          <p>Unlike refined sugar, honey provides sustained energy release. Its natural glucose and fructose are easily absorbed by the body, making it an excellent pre-workout fuel or natural energy booster.</p>
          
          <h3>Skin Healing</h3>
          <p>Applied topically, honey can accelerate wound healing and treat various skin conditions. Its antibacterial and anti-inflammatory properties make it effective for treating burns, cuts, and skin infections.</p>
          
          <h3>Choosing Quality Honey</h3>
          <p>When selecting honey, look for raw, unprocessed varieties. Our premium honey collection is carefully sourced from trusted beekeepers who maintain the highest standards of quality and purity.</p>
        `,
                authorId: adminUser.id,
            },
            {
                title: 'How to Use Saffron in Cooking',
                slug: 'how-to-use-saffron-in-cooking',
                imageUrl: '/assets/mock/2.jpeg',
                summary: 'Learn the art of incorporating saffron into your culinary creations, from proper dosage and preparation techniques to perfect pairing suggestions.',
                content: `
          <h2>The Golden Spice of Kings</h2>
          <p>Saffron, often called the "golden spice," is one of the world's most precious and aromatic spices. Its distinctive flavor and vibrant color can transform ordinary dishes into extraordinary culinary experiences.</p>
          
          <h3>Understanding Saffron Quality</h3>
          <p>High-quality saffron should have deep red threads with golden tips. The aroma should be intense and floral, not musty or stale. Our premium saffron is hand-picked and carefully processed to maintain maximum potency.</p>
          
          <h3>Proper Preparation Techniques</h3>
          <p>To unlock saffron's full potential, gently toast the threads in a dry pan for 30 seconds, then steep them in warm water, broth, or milk for 15-20 minutes. This process releases the spice's essential oils and color.</p>
          
          <h3>Dosage Guidelines</h3>
          <p>A little saffron goes a long way. For most dishes, 2-3 threads per serving is sufficient. For rice dishes, use 1-2 threads per cup of rice. Remember, it's better to start with less and add more if needed.</p>
          
          <h3>Perfect Pairings</h3>
          <p>Saffron pairs beautifully with rice, seafood, chicken, and lamb. It's essential in classic dishes like paella, risotto, and Persian rice. The spice also enhances desserts, particularly those with milk or cream.</p>
          
          <h3>Storage Tips</h3>
          <p>Store saffron in an airtight container in a cool, dark place. Avoid exposure to light and heat, which can degrade the spice's quality and potency over time.</p>
        `,
                authorId: adminUser.id,
            },
            {
                title: 'Top 5 Health Benefits of Dates',
                slug: 'top-5-health-benefits-of-dates',
                imageUrl: '/assets/mock/3.jpeg',
                summary: 'Explore the nutritional powerhouse that is the date fruit, rich in fiber, antioxidants, and natural sugars that provide sustained energy and numerous health benefits.',
                content: `
          <h2>Nature's Energy Bar</h2>
          <p>Dates have been a staple food in Middle Eastern cultures for thousands of years, valued not just for their sweet taste but for their impressive nutritional profile and health benefits.</p>
          
          <h3>1. Rich in Fiber</h3>
          <p>Dates are an excellent source of dietary fiber, which promotes digestive health and helps maintain regular bowel movements. The fiber content also helps you feel full longer, making dates a great snack for weight management.</p>
          
          <h3>2. Natural Energy Boost</h3>
          <p>The natural sugars in dates - glucose, fructose, and sucrose - provide quick energy while the fiber ensures sustained release. This makes dates perfect for pre-workout fuel or as a natural energy booster during the day.</p>
          
          <h3>3. Antioxidant Powerhouse</h3>
          <p>Dates contain various antioxidants including flavonoids, carotenoids, and phenolic acid. These compounds help protect your cells from damage caused by free radicals and may reduce the risk of chronic diseases.</p>
          
          <h3>4. Bone Health Support</h3>
          <p>Dates are rich in minerals like calcium, magnesium, and phosphorus, which are essential for maintaining strong bones and preventing conditions like osteoporosis.</p>
          
          <h3>5. Heart Health Benefits</h3>
          <p>The potassium content in dates helps regulate blood pressure, while the fiber helps lower cholesterol levels. Regular consumption may contribute to overall cardiovascular health.</p>
          
          <h3>Incorporating Dates into Your Diet</h3>
          <p>Enjoy dates as a natural sweetener in smoothies, add them to oatmeal or yogurt, or simply enjoy them as a healthy snack. Our premium date collection offers various varieties, each with its own unique flavor profile.</p>
        `,
                authorId: adminUser.id,
            },
            {
                title: '10 Tips for Effective Online Shopping',
                slug: '10-tips-for-effective-online-shopping',
                imageUrl: '/assets/mock/1.webp',
                summary: 'Master the art of online shopping with these essential tips for finding quality products, securing the best deals, and ensuring a safe and satisfying shopping experience.',
                content: `
          <h2>Navigating the Digital Marketplace</h2>
          <p>Online shopping has revolutionized how we purchase goods, but with so many options available, it's important to shop smartly and safely. Here are ten essential tips to enhance your online shopping experience.</p>
          
          <h3>1. Research Before You Buy</h3>
          <p>Always read product descriptions carefully and compare similar items across different sellers. Look for detailed specifications, materials used, and warranty information.</p>
          
          <h3>2. Read Customer Reviews</h3>
          <p>Customer reviews provide valuable insights into product quality and seller reliability. Pay attention to both positive and negative reviews to get a balanced perspective.</p>
          
          <h3>3. Check Seller Credentials</h3>
          <p>Verify that you're buying from reputable sellers. Look for established businesses with good ratings and clear contact information.</p>
          
          <h3>4. Understand Return Policies</h3>
          <p>Before making a purchase, familiarize yourself with the return and refund policies. This is especially important for clothing, electronics, and other items you might need to return.</p>
          
          <h3>5. Compare Prices</h3>
          <p>Use price comparison tools and check multiple websites to ensure you're getting the best deal. Don't forget to factor in shipping costs and taxes.</p>
          
          <h3>6. Secure Payment Methods</h3>
          <p>Use secure payment methods like credit cards or trusted payment platforms. Avoid sharing sensitive information through unsecured channels.</p>
          
          <h3>7. Check Shipping Information</h3>
          <p>Review shipping times, costs, and tracking options. Some sellers offer free shipping on orders above a certain amount.</p>
          
          <h3>8. Save Money with Coupons</h3>
          <p>Look for discount codes, coupons, and promotional offers. Many retailers offer first-time buyer discounts or seasonal sales.</p>
          
          <h3>9. Keep Records</h3>
          <p>Save order confirmations, receipts, and tracking information. This documentation is essential if you need to track your order or request a refund.</p>
          
          <h3>10. Trust Your Instincts</h3>
          <p>If a deal seems too good to be true, it probably is. Trust your instincts and avoid suspicious offers or sellers with poor reputations.</p>
        `,
                authorId: adminUser.id,
            },
        ];

        console.log('Seeding articles...');

        for (const article of articles) {
            await prisma.article.upsert({
                where: { slug: article.slug },
                update: {},
                create: article,
            });
        }

        console.log('Articles seeded successfully!');
    } catch (error) {
        console.error('Error seeding articles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedArticles(); 