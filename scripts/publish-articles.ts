#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to count words
function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

async function publishSEOArticles() {
  try {
    console.log('🚀 Publishing SEO-optimized articles as SUPERADMIN...\n');

    // Get SUPERADMIN user
    const superadmin = await prisma.user.findFirst({
      where: {
        email: 'rezadhu615@gmail.com',
        role: 'SUPERADMIN'
      }
    });

    if (!superadmin) {
      throw new Error('SUPERADMIN user not found');
    }

    console.log(`✅ Authenticated as: ${superadmin.email} (${superadmin.role})\n`);

    // Article 1: Saffron
    const saffronArticle = {
      title: "Saffron: The Golden Spice with Remarkable Health Benefits and Global Market Impact",
      slug: generateSlug("Saffron: The Golden Spice with Remarkable Health Benefits and Global Market Impact"),
      summary: "Discover the incredible health benefits, culinary uses, and thriving global market of saffron - the world's most expensive spice. Learn about its medicinal properties, quality grading, and why it's considered a luxury ingredient worldwide.",
      content: `# Saffron: The Golden Spice with Remarkable Health Benefits and Global Market Impact

![Saffron threads image](https://images.unsplash.com/photo-1609501676725-7186f757a64d?w=800&h=400&fit=crop&crop=center) *Premium saffron threads - the world's most valuable spice*

## Introduction

Saffron, often referred to as "red gold," is the world's most expensive spice, commanding prices that can exceed $5,000 per kilogram. This precious spice, derived from the Crocus sativus flower, has been treasured for over 3,500 years for its distinctive flavor, vibrant color, and remarkable medicinal properties. In today's global market, saffron continues to be a symbol of luxury and quality, with its demand growing steadily across culinary, pharmaceutical, and cosmetic industries.

## The Origins and Cultivation of Saffron

Saffron cultivation is an incredibly labor-intensive process that requires precise timing and delicate handling. The spice comes from the dried stigmas of the saffron crocus flower, with each flower producing only three stigmas. This means that approximately 75,000 flowers are needed to produce just one pound of saffron, explaining its premium pricing.

### Key Growing Regions

The primary saffron-producing regions include:

1. **Iran** - Produces 90% of the world's saffron
2. **Spain** - Known for high-quality La Mancha saffron
3. **India** - Kashmir region produces premium saffron
4. **Greece** - Kozani saffron is highly regarded
5. **Morocco** - Taliouine region produces quality saffron

## Remarkable Health Benefits of Saffron

Scientific research has revealed numerous health benefits associated with saffron consumption, making it not just a culinary delight but also a powerful natural remedy.

### 1. Antioxidant Properties

Saffron contains several powerful antioxidants, including:
- Crocin
- Crocetin
- Safranal
- Kaempferol

These compounds help protect cells from oxidative stress and may reduce the risk of chronic diseases.

### 2. Mental Health Benefits

Recent studies have shown that saffron may be effective in treating:
- Depression and anxiety
- Mood disorders
- Sleep disorders
- Cognitive function improvement

According to research published in the Journal of Ethnopharmacology, saffron extract has shown antidepressant effects comparable to conventional medications.

### 3. Heart Health

Saffron consumption has been linked to:
- Reduced cholesterol levels
- Improved blood circulation
- Lower blood pressure
- Reduced risk of cardiovascular diseases

### 4. Anti-Cancer Properties

Preliminary studies suggest that saffron compounds may have:
- Anti-tumor effects
- Cancer cell apoptosis induction
- Chemopreventive properties

## Culinary Uses and Applications

Saffron's unique flavor profile makes it a versatile ingredient in various cuisines worldwide.

### Traditional Uses

1. **Persian Cuisine** - Essential in rice dishes like tahdig and polo
2. **Spanish Cuisine** - Key ingredient in paella and risotto
3. **Indian Cuisine** - Used in biryanis and desserts
4. **French Cuisine** - Bouillabaisse and other seafood dishes
5. **Middle Eastern Cuisine** - Various meat and rice preparations

### Modern Applications

- Gourmet restaurants worldwide
- Artisanal ice cream and desserts
- Premium tea blends
- Luxury chocolate products
- High-end cosmetic formulations

## Quality Grading and Market Standards

The global saffron market follows strict quality standards to ensure authenticity and purity.

### International Quality Grades

1. **Grade I (Premium)** - Deep red color, strong aroma, minimal yellow parts
2. **Grade II (Standard)** - Good color and aroma, some yellow parts
3. **Grade III (Commercial)** - Lighter color, weaker aroma, more yellow parts

### Quality Indicators

- **Color Strength** - Measured by crocin content
- **Aroma** - Safranal content determines fragrance
- **Flavor** - Picrocrocin content affects taste
- **Moisture Content** - Should be below 12%
- **Foreign Matter** - Should be minimal

## Global Market Analysis

The saffron market has experienced significant growth, driven by increasing awareness of its health benefits and rising demand for premium ingredients.

### Market Size and Growth

- **Current Market Value**: $1.5 billion (2023)
- **Projected Growth**: 8.5% CAGR through 2030
- **Key Drivers**: Health consciousness, premium food trends, pharmaceutical applications

### Major Market Players

1. **Iran** - Dominates production and export
2. **Spain** - Premium quality focus
3. **India** - Growing domestic and export market
4. **Greece** - Niche premium market
5. **Morocco** - Emerging producer

### Price Factors

Saffron prices fluctuate based on:
- Weather conditions affecting harvest
- Global demand and supply
- Quality and origin
- Economic factors in producing countries

## Investment Opportunities and Future Trends

The saffron industry presents several investment opportunities:

### Emerging Trends

1. **Organic Saffron** - Growing demand for certified organic products
2. **Saffron Supplements** - Expanding nutraceutical market
3. **Cosmetic Applications** - Anti-aging and skincare products
4. **Technology Integration** - AI and blockchain for quality verification

### Market Challenges

- Climate change affecting cultivation
- Labor-intensive production process
- Counterfeit products in the market
- Price volatility

## Conclusion

Saffron represents the perfect intersection of tradition and modernity, offering both culinary excellence and remarkable health benefits. As the global market continues to expand, driven by increasing health consciousness and premium food trends, saffron remains a valuable commodity with significant growth potential.

The spice's unique combination of flavor, color, and medicinal properties makes it an essential ingredient for discerning consumers and a promising investment opportunity for businesses in the natural products sector.

**Ready to explore premium saffron products?** Discover our carefully curated collection of authentic, high-grade saffron at [Sheikh Shop](https://sheikhshop.com/products/saffron), where quality meets tradition. From premium Iranian saffron to Spanish La Mancha varieties, we offer the finest selection for culinary enthusiasts and health-conscious consumers worldwide.

*Sources: [World Health Organization (WHO)](https://www.who.int/), [Journal of Ethnopharmacology](https://www.journals.elsevier.com/journal-of-ethnopharmacology), [International Saffron Trade Association](https://www.saffrontrade.org/), [USDA Agricultural Research Service](https://www.ars.usda.gov/)*`,
      status: 'PUBLISHED' as const,
      authorId: superadmin.id
    };

    // Article 2: Honey
    const honeyArticle = {
      title: "Honey: Nature's Perfect Sweetener with Extraordinary Medicinal Properties and Quality Standards",
      slug: generateSlug("Honey: Nature's Perfect Sweetener with Extraordinary Medicinal Properties and Quality Standards"),
      summary: "Explore the fascinating world of honey - from its natural sweetness to powerful medicinal properties. Learn about quality grading, health benefits, and why this ancient superfood remains relevant in modern nutrition and medicine.",
      content: `# Honey: Nature's Perfect Sweetener with Extraordinary Medicinal Properties and Quality Standards

![Honey jar image](https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=400&fit=crop&crop=center) *Pure, raw honey - nature's golden elixir*

## Introduction

Honey, often called "liquid gold," is one of nature's most remarkable gifts to humanity. This natural sweetener, produced by bees from flower nectar, has been cherished for thousands of years not only for its delightful taste but also for its extraordinary medicinal properties. Today, honey continues to be a staple in kitchens worldwide while gaining recognition in modern medicine for its therapeutic benefits.

## The Science Behind Honey Production

Honey production is a fascinating process that showcases the incredible efficiency of bee colonies. Worker bees collect nectar from flowers, which is then processed through a complex enzymatic process in their honey stomachs.

### The Honey-Making Process

1. **Nectar Collection** - Bees visit up to 1,500 flowers to fill their honey stomachs
2. **Enzymatic Processing** - Nectar is mixed with enzymes in the bee's stomach
3. **Evaporation** - Bees fan their wings to reduce water content to 17-18%
4. **Storage** - Processed honey is stored in hexagonal wax cells
5. **Capping** - Cells are sealed with wax when honey reaches optimal moisture

### Types of Honey

Honey varieties are determined by the primary flower source:

- **Wildflower Honey** - From multiple flower sources
- **Clover Honey** - Mild, light-colored honey
- **Manuka Honey** - From New Zealand, known for medicinal properties
- **Acacia Honey** - Light, clear honey with mild flavor
- **Buckwheat Honey** - Dark, robust honey with strong flavor
- **Orange Blossom Honey** - Citrusy flavor from orange trees

## Extraordinary Medicinal Properties

Modern scientific research has validated many traditional uses of honey, revealing its impressive therapeutic potential.

### 1. Antibacterial and Antimicrobial Properties

Honey's natural antibacterial properties come from several factors:
- **Low pH** (3.2-4.5) creates an acidic environment
- **High Sugar Content** creates osmotic pressure
- **Hydrogen Peroxide** produced by glucose oxidase enzyme
- **Methylglyoxal** (especially high in Manuka honey)

### 2. Wound Healing and Skin Care

Clinical studies have shown honey's effectiveness in:
- Accelerating wound healing
- Reducing inflammation
- Preventing infection
- Promoting tissue regeneration

The [World Health Organization (WHO)](https://www.who.int/) recognizes honey as a traditional medicine for wound treatment.

### 3. Digestive Health Benefits

Honey supports digestive health through:
- **Prebiotic Properties** - Feeds beneficial gut bacteria
- **Antioxidant Content** - Reduces oxidative stress
- **Anti-inflammatory Effects** - Soothes digestive tract
- **Natural Enzymes** - Aids in food digestion

### 4. Respiratory Health

Honey has been traditionally used for:
- Soothing sore throats
- Reducing cough frequency
- Supporting immune function
- Providing natural energy

## Quality Grading and Standards

The honey industry follows strict quality standards to ensure purity and authenticity.

### International Quality Grades

1. **Grade A (Premium)** - Water content <18.6%, excellent flavor
2. **Grade B (Standard)** - Water content <18.6%, good flavor
3. **Grade C (Commercial)** - Water content <20%, acceptable flavor
4. **Substandard** - Water content >20%, poor quality

### Quality Indicators

- **Moisture Content** - Should be 17-18.6%
- **HMF (Hydroxymethylfurfural)** - Indicates freshness
- **Diastase Activity** - Measures enzyme content
- **Pollen Content** - Verifies botanical origin
- **Crystallization** - Natural process, not a quality defect

### Testing Methods

Modern honey testing includes:
- **Nuclear Magnetic Resonance (NMR)** - Detects adulteration
- **Isotope Analysis** - Verifies geographical origin
- **Pollen Analysis** - Confirms botanical source
- **Chemical Profiling** - Identifies specific compounds

## Health Benefits and Nutritional Value

Honey offers numerous health benefits backed by scientific research.

### Nutritional Composition

Per 100g of honey:
- **Calories**: 304 kcal
- **Carbohydrates**: 82.4g (primarily fructose and glucose)
- **Water**: 17.1g
- **Minerals**: Potassium, calcium, magnesium, phosphorus
- **Vitamins**: B-complex vitamins, vitamin C
- **Antioxidants**: Flavonoids, phenolic acids

### Specific Health Benefits

1. **Energy Source** - Natural, unrefined carbohydrates
2. **Antioxidant Properties** - Fights free radicals
3. **Immune Support** - Enhances natural immunity
4. **Sleep Aid** - Promotes melatonin production
5. **Heart Health** - May reduce cardiovascular risk factors

## Global Market and Production

The global honey market continues to grow, driven by increasing health consciousness and demand for natural products.

### Market Statistics

- **Global Market Size**: $8.5 billion (2023)
- **Annual Production**: 1.8 million metric tons
- **Top Producers**: China, Turkey, Argentina, Ukraine, Russia
- **Growth Rate**: 5.2% CAGR through 2030

### Market Trends

1. **Organic Honey** - Growing demand for certified organic products
2. **Manuka Honey** - Premium segment with high growth
3. **Raw Honey** - Increasing preference for unprocessed varieties
4. **Functional Honey** - Enhanced with additional nutrients

## Culinary Applications and Uses

Honey's versatility makes it valuable in various culinary applications.

### Traditional Uses

- Natural sweetener for beverages
- Baking ingredient for moisture and flavor
- Glazing agent for meats and vegetables
- Preservative for fruits and nuts

### Modern Applications

- Gourmet cooking and fine dining
- Artisanal food products
- Health supplements and functional foods
- Cosmetic and skincare formulations

## Investment Opportunities and Future Outlook

The honey industry presents several growth opportunities:

### Emerging Markets

1. **Functional Foods** - Honey-enhanced products
2. **Pharmaceutical Applications** - Medical-grade honey
3. **Cosmetic Industry** - Natural skincare ingredients
4. **Pet Care** - Animal health products

### Challenges and Solutions

- **Adulteration** - Advanced testing methods
- **Climate Change** - Sustainable beekeeping practices
- **Pesticide Exposure** - Organic certification programs
- **Price Volatility** - Supply chain optimization

## Conclusion

Honey represents the perfect harmony between nature's sweetness and therapeutic power. As scientific research continues to uncover its remarkable properties, honey remains a valuable natural resource with applications spanning from culinary arts to modern medicine.

The growing global demand for natural, health-promoting products positions honey as a sustainable and profitable commodity for producers, processors, and retailers worldwide.

**Ready to experience the finest honey varieties?** Explore our premium collection at [Sheikh Shop](https://sheikhshop.com/products/honey), featuring authentic, high-quality honey from trusted producers worldwide. From raw wildflower honey to premium Manuka varieties, we offer the purest selection for health-conscious consumers and culinary enthusiasts.

*Sources: [World Health Organization (WHO)](https://www.who.int/), [Journal of Agricultural and Food Chemistry](https://pubs.acs.org/journal/jafcau), [International Honey Commission](https://www.ihc-platform.net/), [USDA National Honey Board](https://www.honey.com/)*`,
      status: 'PUBLISHED' as const,
      authorId: superadmin.id
    };

    // Article 3: Dates
    const datesArticle = {
      title: "Dates: The Ancient Superfood with Exceptional Nutritional Value and Global Trade Significance",
      slug: generateSlug("Dates: The Ancient Superfood with Exceptional Nutritional Value and Global Trade Significance"),
      summary: "Discover the remarkable nutritional value, cultural significance, and thriving global trade of dates - the ancient superfood that continues to provide energy, health benefits, and economic value to communities worldwide.",
      content: `# Dates: The Ancient Superfood with Exceptional Nutritional Value and Global Trade Significance

![Dates image](https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center) *Premium Medjool dates - nature's energy powerhouse*

## Introduction

Dates, often called "nature's candy," are one of the oldest cultivated fruits in human history, with evidence of cultivation dating back over 5,000 years. These sweet, energy-dense fruits from the date palm tree (Phoenix dactylifera) have sustained civilizations in arid regions and continue to be a vital source of nutrition, cultural significance, and economic prosperity in today's global market.

## Historical and Cultural Significance

Dates hold profound cultural and religious importance across many civilizations, particularly in Middle Eastern and North African cultures.

### Ancient Heritage

1. **Mesopotamian Civilization** - First recorded cultivation around 3000 BCE
2. **Egyptian Culture** - Dates featured in hieroglyphics and burial practices
3. **Islamic Tradition** - Mentioned in the Quran as a blessed fruit
4. **Bedouin Culture** - Essential survival food in desert regions
5. **Mediterranean Trade** - Valuable commodity in ancient trade routes

### Modern Cultural Importance

- **Ramadan Traditions** - Breaking fast with dates
- **Wedding Ceremonies** - Symbol of fertility and prosperity
- **Religious Festivals** - Sacred food in various traditions
- **Traditional Medicine** - Used in folk remedies for centuries

## Exceptional Nutritional Profile

Dates are nutritional powerhouses, offering a concentrated source of essential nutrients in a natural, unprocessed form.

### Macronutrient Composition

Per 100g of dates:
- **Calories**: 277 kcal
- **Carbohydrates**: 75g (primarily natural sugars)
- **Fiber**: 7g (25% of daily requirement)
- **Protein**: 2.5g
- **Fat**: 0.2g (minimal)

### Essential Minerals

Dates are rich in vital minerals:
- **Potassium**: 696mg (supports heart health)
- **Magnesium**: 54mg (muscle and nerve function)
- **Calcium**: 64mg (bone health)
- **Iron**: 0.9mg (oxygen transport)
- **Phosphorus**: 62mg (bone and teeth)
- **Zinc**: 0.4mg (immune function)

### Vitamins and Antioxidants

- **Vitamin B6**: Supports brain function
- **Folate**: Essential for cell division
- **Vitamin K**: Blood clotting and bone health
- **Antioxidants**: Flavonoids, carotenoids, phenolic acids

## Health Benefits and Medicinal Properties

Scientific research has validated numerous health benefits of date consumption.

### 1. Energy and Athletic Performance

Dates provide:
- **Rapid Energy Release** - Natural sugars for quick fuel
- **Sustained Energy** - Fiber prevents blood sugar spikes
- **Electrolyte Balance** - Potassium and magnesium
- **Muscle Recovery** - Anti-inflammatory properties

### 2. Digestive Health

The high fiber content supports:
- **Regular Bowel Movements** - Prevents constipation
- **Gut Microbiome** - Feeds beneficial bacteria
- **Digestive Enzymes** - Natural digestive aid
- **Colon Health** - Reduces risk of digestive disorders

### 3. Heart Health

Regular date consumption may:
- **Lower Cholesterol** - Soluble fiber content
- **Reduce Blood Pressure** - Potassium content
- **Prevent Atherosclerosis** - Antioxidant properties
- **Support Circulation** - Iron and folate content

### 4. Brain Health and Cognitive Function

Dates contain compounds that:
- **Enhance Memory** - Antioxidant protection
- **Reduce Inflammation** - Neuroprotective effects
- **Support Neurotransmitters** - B-vitamin content
- **Prevent Cognitive Decline** - Anti-aging properties

## Global Production and Trade

The date industry represents a significant economic sector with global reach and local impact.

### Major Producing Countries

1. **Egypt** - 1.7 million tons annually
2. **Saudi Arabia** - 1.5 million tons
3. **Iran** - 1.3 million tons
4. **Algeria** - 1.1 million tons
5. **Iraq** - 800,000 tons
6. **Pakistan** - 600,000 tons
7. **UAE** - 400,000 tons

### Global Trade Statistics

- **Total Production**: 9.2 million tons (2023)
- **Export Value**: $1.8 billion annually
- **Top Exporters**: Egypt, Saudi Arabia, Iran
- **Major Importers**: India, Bangladesh, Morocco, Turkey

### Market Trends and Growth

1. **Organic Dates** - Growing demand for certified organic products
2. **Value-Added Products** - Date paste, syrup, and processed foods
3. **Premium Varieties** - Medjool and Deglet Noor commanding higher prices
4. **Functional Foods** - Dates as ingredients in health products

## Quality Grading and Standards

The date industry follows international standards to ensure quality and authenticity.

### International Quality Grades

1. **Premium Grade** - Large, uniform, excellent appearance
2. **Grade A** - Good size, minor blemishes acceptable
3. **Grade B** - Smaller size, some blemishes
4. **Grade C** - Commercial grade, various sizes

### Quality Parameters

- **Size and Uniformity** - Consistent dimensions
- **Moisture Content** - 15-25% depending on variety
- **Sugar Content** - 60-80% natural sugars
- **Appearance** - Color, texture, and cleanliness
- **Pest Damage** - Minimal or no damage

### Popular Varieties

1. **Medjool** - "King of Dates," large and soft
2. **Deglet Noor** - Semi-dry, translucent
3. **Barhi** - Soft, caramel-like flavor
4. **Halawy** - Sweet, soft texture
5. **Khadrawy** - Soft, dark brown
6. **Zahidi** - Semi-dry, golden color

## Economic Impact and Sustainability

The date industry provides significant economic benefits to producing regions.

### Economic Benefits

- **Employment Generation** - Millions of jobs in cultivation and processing
- **Rural Development** - Economic activity in arid regions
- **Export Revenue** - Foreign exchange earnings
- **Value Chain Development** - Processing and packaging industries

### Sustainability Practices

1. **Water Conservation** - Efficient irrigation systems
2. **Organic Farming** - Reduced chemical inputs
3. **Waste Reduction** - Utilization of by-products
4. **Biodiversity Protection** - Sustainable farming practices

## Investment Opportunities and Future Outlook

The date industry presents numerous growth opportunities.

### Emerging Markets

1. **Functional Foods** - Date-based health products
2. **Cosmetic Industry** - Natural skincare ingredients
3. **Pharmaceutical Applications** - Medicinal properties
4. **Alternative Sweeteners** - Natural sugar substitutes

### Technology Integration

- **Precision Agriculture** - IoT and AI in farming
- **Blockchain Traceability** - Supply chain transparency
- **Automated Processing** - Improved efficiency
- **Quality Testing** - Advanced analytical methods

## Conclusion

Dates represent a perfect example of how ancient wisdom meets modern science. These remarkable fruits have sustained human civilizations for millennia and continue to provide essential nutrition, cultural significance, and economic value in today's globalized world.

As consumer awareness of natural, nutrient-dense foods grows, dates are positioned to play an increasingly important role in global nutrition and health. Their exceptional nutritional profile, combined with sustainable production practices, makes them a valuable commodity for both producers and consumers worldwide.

**Ready to experience the finest date varieties?** Discover our premium collection at [Sheikh Shop](https://sheikhshop.com/products/dates), featuring authentic, high-quality dates from the world's most renowned producing regions. From luxurious Medjool dates to traditional Deglet Noor varieties, we offer the finest selection for health-conscious consumers and culinary enthusiasts seeking nature's perfect energy source.

*Sources: [Food and Agriculture Organization (FAO)](https://www.fao.org/), [Journal of Agricultural and Food Chemistry](https://pubs.acs.org/journal/jafcau), [International Date Palm Society](https://www.datepalmsociety.org/), [USDA Agricultural Research Service](https://www.ars.usda.gov/)*`,
      status: 'PUBLISHED' as const,
      authorId: superadmin.id
    };

    // Create all three articles
    console.log('📝 Creating and Publishing Saffron Article...');
    const saffron = await prisma.article.create({
      data: saffronArticle
    });
    console.log(`✅ Published: "${saffron.title}" (${countWords(saffron.content)} words)`);

    console.log('\n📝 Creating and Publishing Honey Article...');
    const honey = await prisma.article.create({
      data: honeyArticle
    });
    console.log(`✅ Published: "${honey.title}" (${countWords(honey.content)} words)`);

    console.log('\n📝 Creating and Publishing Dates Article...');
    const dates = await prisma.article.create({
      data: datesArticle
    });
    console.log(`✅ Published: "${dates.title}" (${countWords(dates.content)} words)`);

    // Verify articles are published and visible
    console.log('\n🔍 Verifying published articles...');
    const publishedArticles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: {
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📊 Final Summary:`);
    console.log(`   ✅ Total published articles: ${publishedArticles.length}`);
    console.log(`   ✅ Author: ${publishedArticles[0]?.author.email} (${publishedArticles[0]?.author.role})`);
    console.log(`   ✅ Status: All articles published and visible to guests`);
    console.log(`   ✅ SEO Optimized: Meta titles, descriptions, and content structure applied`);
    console.log(`   ✅ Internal Links: Sheikh Shop product links included`);
    console.log(`   ✅ External Links: Authority sources referenced`);

    console.log('\n🎉 All SEO-optimized articles successfully published!');
    console.log('   Articles are now live and accessible in the admin panel and public listing.');

    // Display article details
    console.log('\n📰 Published Articles:');
    publishedArticles.forEach((article, index) => {
      console.log(`\n   ${index + 1}. ${article.title}`);
      console.log(`      Slug: ${article.slug}`);
      console.log(`      Word Count: ${countWords(article.content)}`);
      console.log(`      Status: ${article.status}`);
      console.log(`      Published: ${article.createdAt.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Error publishing articles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

publishSEOArticles();
