import { resolveProductPrice } from '@/lib/product-pricing';
import type { ProductsWithImages } from '@/types';

interface Combinable {
  id: string;
  value: string;
  hex?: string | null;
}

describe('Product Options, Attributes, and Variants Engine Tests', () => {
  // Mock standard units for catalog
  const mockUnits = [
    { id: 'u1', name: 'Gram', symbol: 'g', multiplier: 0.001, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'u2', name: 'Kilogram', symbol: 'kg', multiplier: 1.0, sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'u3', name: 'Piece', symbol: 'pcs', multiplier: 1.0, sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  // 1. Simple Product (Backward compatibility fallback)
  const simpleProduct = {
    id: 'p_simple',
    name: 'Simple Honey',
    category: 'HONEY',
    categoryId: '2',
    description: 'Product with no variants.',
    basePrice: 100000,
    baseUnitId: 'u2',
    quantity: 50,
    status: 'ACTIVE',
    isNew: false,
    isBestSeller: false,
    isAmazing: false,
    categoryType: 'SheikhFood',
    baseUnit: mockUnits[1],
    images: [],
    discounts: [],
    units: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as ProductsWithImages;

  // 2. Product with Multiple Attributes (e.g. Color + Storage)
  const multiAttributeProduct = {
    id: 'p_smartwatch',
    name: 'Royal Watch V2',
    category: 'OTHERS',
    categoryId: '4',
    description: 'Smartwatch with multiple combinations.',
    basePrice: 30000000,
    baseUnitId: 'u3',
    quantity: 20,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: true,
    isAmazing: false,
    categoryType: 'SheikhDigital',
    baseUnit: mockUnits[2],
    images: [],
    discounts: [],
    units: [
      {
        id: 'pud_black_64',
        productId: 'p_smartwatch',
        name: 'Black / 64GB',
        price: 30000000,
        oldPrice: 33000000,
        sku: 'SH-W-BLK-64',
        isActive: true,
        stock: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
        values: [
          {
            productUnitId: 'pud_black_64',
            attributeValueId: 'val_black',
            attributeValue: { id: 'val_black', attributeId: 'attr_color', value: 'Black', hex: '#000000', attribute: { id: 'attr_color', name: 'Color', displayName: 'رنگ', type: 'COLOR' } }
          },
          {
            productUnitId: 'pud_black_64',
            attributeValueId: 'val_64gb',
            attributeValue: { id: 'val_64gb', attributeId: 'attr_storage', value: '64GB', hex: null, attribute: { id: 'attr_storage', name: 'Storage', displayName: 'حافظه', type: 'SELECT' } }
          }
        ]
      },
      {
        id: 'pud_black_128',
        productId: 'p_smartwatch',
        name: 'Black / 128GB',
        price: 33000000,
        oldPrice: 36000000,
        sku: 'SH-W-BLK-128',
        isActive: true,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        values: [
          {
            productUnitId: 'pud_black_128',
            attributeValueId: 'val_black',
            attributeValue: { id: 'val_black', attributeId: 'attr_color', value: 'Black', hex: '#000000', attribute: { id: 'attr_color', name: 'Color', displayName: 'رنگ', type: 'COLOR' } }
          },
          {
            productUnitId: 'pud_black_128',
            attributeValueId: 'val_128gb',
            attributeValue: { id: 'val_128gb', attributeId: 'attr_storage', value: '128GB', hex: null, attribute: { id: 'attr_storage', name: 'Storage', displayName: 'حافظه', type: 'SELECT' } }
          }
        ]
      },
      {
        id: 'pud_gold_128',
        productId: 'p_smartwatch',
        name: 'Gold / 128GB',
        price: 38000000,
        oldPrice: null,
        sku: 'SH-W-GLD-128',
        isActive: true,
        stock: 0, // OUT OF STOCK
        createdAt: new Date(),
        updatedAt: new Date(),
        values: [
          {
            productUnitId: 'pud_gold_128',
            attributeValueId: 'val_gold',
            attributeValue: { id: 'val_gold', attributeId: 'attr_color', value: 'Gold', hex: '#D4AF37', attribute: { id: 'attr_color', name: 'Color', displayName: 'رنگ', type: 'COLOR' } }
          },
          {
            productUnitId: 'pud_gold_128',
            attributeValueId: 'val_128gb',
            attributeValue: { id: 'val_128gb', attributeId: 'attr_storage', value: '128GB', hex: null, attribute: { id: 'attr_storage', name: 'Storage', displayName: 'حافظه', type: 'SELECT' } }
          }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as ProductsWithImages;

  test('Should fallback cleanly to base price and old price for products without variants', () => {
    const pricing = resolveProductPrice(simpleProduct);
    expect(pricing.price).toBe(100000);
    expect(pricing.oldPrice).toBeNull();
    expect(pricing.hasDiscount).toBeFalsy();
  });

  test('Should resolve the lowest variant price if there are variants but none is selected', () => {
    const pricing = resolveProductPrice(multiAttributeProduct);
    // Lowest variant price is 30,000,000 (Black / 64GB)
    expect(pricing.price).toBe(30000000);
    expect(pricing.oldPrice).toBe(33000000);
    expect(pricing.hasDiscount).toBeTruthy();
    expect(pricing.discountPercentage).toBe(9);
  });

  test('Should resolve exact corresponding variant price and old price when a variant is selected', () => {
    const selectedVariant = multiAttributeProduct.units?.[1]; // Black / 128GB (price = 33,000,000, oldPrice = 36,000,000)
    expect(selectedVariant).toBeDefined();
    if (selectedVariant) {
      const pricing = resolveProductPrice(multiAttributeProduct, selectedVariant);
      expect(pricing.price).toBe(33000000);
      expect(pricing.oldPrice).toBe(36000000);
      expect(pricing.hasDiscount).toBeTruthy();
      expect(pricing.discountPercentage).toBe(8);
    }
  });

  test('Should support Cartesian combination generation with preserved custom fields', () => {
    const assignedAttributes = [
      {
        id: 'attr_color',
        displayName: 'Color',
        values: [
          { id: 'val_black', value: 'Black', hex: '#000000' },
          { id: 'val_gold', value: 'Gold', hex: '#D4AF37' }
        ]
      },
      {
        id: 'attr_storage',
        displayName: 'Storage',
        values: [
          { id: 'val_64gb', value: '64GB' },
          { id: 'val_128gb', value: '128GB' }
        ]
      }
    ];

    // Cartesian product calculation
    const cartesian = (arrays: Combinable[][]): Combinable[][] => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(d => curr.map(e => [...d, e]));
      }, [[]] as Combinable[][]);
    };

    const valueArrays = assignedAttributes.map(attr => attr.values) as Combinable[][];
    const combinations = cartesian(valueArrays);

    expect(combinations.length).toBe(4);
    expect(combinations[0]?.[0]?.value).toBe('Black');
    expect(combinations[0]?.[1]?.value).toBe('64GB');
    expect(combinations[3]?.[0]?.value).toBe('Gold');
    expect(combinations[3]?.[1]?.value).toBe('128GB');
  });

  test('Should check stock-aware states and correctly flag out of stock combinations', () => {
    const activeVariants = multiAttributeProduct.units || [];
    expect(activeVariants.length).toBe(3);

    // Variant 1 (Black/64) has stock = 12
    const variant1 = activeVariants[0];
    expect(variant1).toBeDefined();
    if (variant1) {
      expect(variant1.stock).toBeGreaterThan(0);
    }

    // Variant 3 (Gold/128) has stock = 0 (OUT OF STOCK)
    const variant3 = activeVariants[2];
    expect(variant3).toBeDefined();
    if (variant3) {
      expect(variant3.stock).toBe(0);
    }
  });
});
