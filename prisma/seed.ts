import "dotenv/config";
import { PrismaClient, UserRole, UserStatus, AdminRole, AddressType, OrderStatus, PaymentStatus, CouponType } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Minsah Beauty database seed...');

  // ==========================================
  // 1. Admin Users
  // ==========================================
  console.log('👤 Creating admin users...');
  
  const adminPassword = await bcrypt.hash('ChangeThisPassword123!', 12);
  
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@minsahbeauty.cloud' },
    update: {},
    create: {
      email: 'admin@minsahbeauty.cloud',
      passwordHash: adminPassword,
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const manager = await prisma.adminUser.upsert({
    where: { email: 'manager@minsahbeauty.cloud' },
    update: {},
    create: {
      email: 'manager@minsahbeauty.cloud',
      passwordHash: adminPassword,
      name: 'Store Manager',
      role: AdminRole.MANAGER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Admin users created');

  // ==========================================
  // 2. Brands (Combined: Your brand + Real brands)
  // ==========================================
  console.log('🏷️  Creating brands...');

  const brands = await Promise.all([
    // Your original brand (featured)
    prisma.brand.upsert({
      where: { slug: 'minsah-beauty' },
      update: {},
      create: {
        name: 'Minsah Beauty',
        slug: 'minsah-beauty',
        description: 'Our signature brand of premium beauty products',
        logo: '/brands/minsah-beauty.png',
        website: 'https://minsahbeauty.cloud',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'natural-glow' },
      update: {},
      create: {
        name: 'Natural Glow',
        slug: 'natural-glow',
        description: 'Organic and natural beauty products',
        logo: '/brands/natural-glow.png',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'luxe-beauty' },
      update: {},
      create: {
        name: 'Luxe Beauty',
        slug: 'luxe-beauty',
        description: 'Premium luxury cosmetics',
        logo: '/brands/luxe-beauty.png',
        isActive: true,
      },
    }),
    // Real international brands
    prisma.brand.upsert({
      where: { slug: 'revlon' },
      update: {},
      create: {
        name: 'Revlon',
        slug: 'revlon',
        description: 'Premium American cosmetics brand',
        logo: '/brands/revlon.png',
        website: 'https://www.revlon.com',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'maybelline' },
      update: {},
      create: {
        name: 'Maybelline',
        slug: 'maybelline',
        description: 'New York based makeup brand',
        logo: '/brands/maybelline.png',
        website: 'https://www.maybelline.com',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'loreal' },
      update: {},
      create: {
        name: "L'Oréal Paris",
        slug: 'loreal',
        description: 'Because you\'re worth it',
        logo: '/brands/loreal.png',
        website: 'https://www.loreal.com',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'garnier' },
      update: {},
      create: {
        name: 'Garnier',
        slug: 'garnier',
        description: 'Natural beauty and skincare',
        logo: '/brands/garnier.png',
        website: 'https://www.garnier.com',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Brands created');

  // ==========================================
  // 3. Categories (Your 8 categories with hierarchy)
  // ==========================================
  console.log('📂 Creating categories...');

  // Main categories
  const skincare = await prisma.category.upsert({
    where: { slug: 'skincare' },
    update: {},
    create: {
      name: 'Skincare',
      slug: 'skincare',
      description: 'Face and body skincare products',
      image: '/categories/skincare.jpg',
      isActive: true,
      sortOrder: 0,
    },
  });

  const makeup = await prisma.category.upsert({
    where: { slug: 'makeup' },
    update: {},
    create: {
      name: 'Makeup',
      slug: 'makeup',
      description: 'Professional makeup and cosmetics',
      image: '/categories/makeup.jpg',
      isActive: true,
      sortOrder: 1,
    },
  });

  const haircare = await prisma.category.upsert({
    where: { slug: 'hair-care' },
    update: {},
    create: {
      name: 'Hair Care',
      slug: 'hair-care',
      description: 'Shampoos, conditioners, and treatments',
      image: '/categories/hair-care.jpg',
      isActive: true,
      sortOrder: 2,
    },
  });

  const fragrances = await prisma.category.upsert({
    where: { slug: 'fragrances' },
    update: {},
    create: {
      name: 'Fragrances',
      slug: 'fragrances',
      description: 'Perfumes and body sprays',
      image: '/categories/fragrances.jpg',
      isActive: true,
      sortOrder: 3,
    },
  });

  const bathBody = await prisma.category.upsert({
    where: { slug: 'bath-body' },
    update: {},
    create: {
      name: 'Bath & Body',
      slug: 'bath-body',
      description: 'Body washes, lotions, and spa products',
      image: '/categories/bath-body.jpg',
      isActive: true,
      sortOrder: 4,
    },
  });

  const nailCare = await prisma.category.upsert({
    where: { slug: 'nail-care' },
    update: {},
    create: {
      name: 'Nail Care',
      slug: 'nail-care',
      description: 'Nail polish and nail care products',
      image: '/categories/nail-care.jpg',
      isActive: true,
      sortOrder: 5,
    },
  });

  const toolsBrushes = await prisma.category.upsert({
    where: { slug: 'tools-brushes' },
    update: {},
    create: {
      name: 'Tools & Brushes',
      slug: 'tools-brushes',
      description: 'Makeup brushes and beauty tools',
      image: '/categories/tools-brushes.jpg',
      isActive: true,
      sortOrder: 6,
    },
  });

  const giftSets = await prisma.category.upsert({
    where: { slug: 'gift-sets' },
    update: {},
    create: {
      name: 'Gift Sets',
      slug: 'gift-sets',
      description: 'Curated beauty gift sets',
      image: '/categories/gift-sets.jpg',
      isActive: true,
      sortOrder: 7,
    },
  });

  // Makeup subcategories
  const lips = await prisma.category.upsert({
    where: { slug: 'lips' },
    update: {},
    create: {
      name: 'Lips',
      slug: 'lips',
      description: 'Lipsticks, glosses, and lip liners',
      parentId: makeup.id,
      isActive: true,
      sortOrder: 0,
    },
  });

  const eyes = await prisma.category.upsert({
    where: { slug: 'eyes' },
    update: {},
    create: {
      name: 'Eyes',
      slug: 'eyes',
      description: 'Eye makeup essentials',
      parentId: makeup.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const face = await prisma.category.upsert({
    where: { slug: 'face' },
    update: {},
    create: {
      name: 'Face',
      slug: 'face',
      description: 'Foundation, concealer, and powder',
      parentId: makeup.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  console.log('✅ Categories created');

  // ==========================================
  // 4. Products (Combined: Your products + Real products)
  // ==========================================
  console.log('🛍️  Creating products...');

  // YOUR ORIGINAL PRODUCTS (Minsah Beauty brand)
  const product1 = await prisma.product.upsert({
    where: { sku: 'MSB-SKN-001' },
    update: {},
    create: {
      sku: 'MSB-SKN-001',
      name: 'Hydrating Face Serum',
      slug: 'hydrating-face-serum',
      description: 'A lightweight, hydrating serum that delivers intense moisture to your skin. Formulated with hyaluronic acid and vitamin E.',
      shortDescription: 'Intense hydration serum with hyaluronic acid',
      price: 1299,
      compareAtPrice: 1599,
      costPrice: 900,
      quantity: 100,
      lowStockThreshold: 10,
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      isNew: true,
      categoryId: skincare.id,
      brandId: brands[0].id, // Minsah Beauty
      metaTitle: 'Hydrating Face Serum - Minsah Beauty',
      metaDescription: 'Premium hydrating serum from Minsah Beauty',
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: 'MSB-SKN-002' },
    update: {},
    create: {
      sku: 'MSB-SKN-002',
      name: 'Vitamin C Brightening Cream',
      slug: 'vitamin-c-brightening-cream',
      description: 'Brighten your complexion with this powerful vitamin C cream. Helps reduce dark spots and evens skin tone.',
      shortDescription: 'Brightening cream with vitamin C',
      price: 999,
      compareAtPrice: 1199,
      costPrice: 700,
      quantity: 75,
      lowStockThreshold: 10,
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      isNew: false,
      categoryId: skincare.id,
      brandId: brands[0].id, // Minsah Beauty
      metaTitle: 'Vitamin C Brightening Cream - Minsah Beauty',
      metaDescription: 'Brighten your skin with vitamin C',
    },
  });

  const product3 = await prisma.product.upsert({
    where: { sku: 'MSB-SKN-003' },
    update: {},
    create: {
      sku: 'MSB-SKN-003',
      name: 'Gentle Foaming Cleanser',
      slug: 'gentle-foaming-cleanser',
      description: 'A gentle, sulfate-free foaming cleanser suitable for all skin types. Removes impurities without stripping natural oils.',
      shortDescription: 'Gentle sulfate-free cleanser',
      price: 599,
      costPrice: 400,
      quantity: 150,
      lowStockThreshold: 15,
      trackInventory: true,
      isActive: true,
      isFeatured: false,
      isNew: true,
      categoryId: skincare.id,
      brandId: brands[0].id, // Minsah Beauty
    },
  });

  // REAL BRAND PRODUCTS (Revlon, Maybelline, etc.)
  const lipstick1 = await prisma.product.upsert({
    where: { sku: 'REV-LIPS-001' },
    update: {},
    create: {
      sku: 'REV-LIPS-001',
      name: 'Revlon Super Lustrous Lipstick - Fire & Ice',
      slug: 'revlon-super-lustrous-fire-ice',
      description: 'Iconic red lipstick with rich, creamy color and a lustrous finish. Infused with Vitamin E and Avocado oil for smooth application.',
      shortDescription: 'Classic red lipstick with creamy finish',
      price: 850,
      compareAtPrice: 1200,
      costPrice: 600,
      quantity: 150,
      lowStockThreshold: 10,
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      isNew: false,
      categoryId: lips.id,
      brandId: brands[3].id, // Revlon
      metaTitle: 'Revlon Fire & Ice Red Lipstick - Minsah Beauty',
      metaDescription: 'Shop Revlon Super Lustrous Fire & Ice lipstick in Bangladesh',
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: lipstick1.id,
        url: '/products/revlon-fire-ice-1.jpg',
        alt: 'Revlon Fire & Ice Lipstick',
        sortOrder: 1,
        isDefault: true,
      },
      {
        productId: lipstick1.id,
        url: '/products/revlon-fire-ice-2.jpg',
        alt: 'Revlon Fire & Ice Swatch',
        sortOrder: 2,
        isDefault: false,
      },
    ],
    skipDuplicates: true,
  });

  const lipstick2 = await prisma.product.upsert({
    where: { sku: 'MAY-LIPS-001' },
    update: {},
    create: {
      sku: 'MAY-LIPS-001',
      name: 'Maybelline SuperStay Matte Ink - Voyager',
      slug: 'maybelline-superstay-matte-ink-voyager',
      description: 'Long-lasting liquid lipstick with up to 16-hour wear. Transfer-proof and smudge-proof formula.',
      shortDescription: '16-hour liquid matte lipstick',
      price: 950,
      compareAtPrice: 1300,
      costPrice: 650,
      quantity: 200,
      lowStockThreshold: 15,
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      isNew: true,
      categoryId: lips.id,
      brandId: brands[4].id, // Maybelline
      metaTitle: 'Maybelline SuperStay Matte Ink Voyager - Long Lasting',
      metaDescription: '16-hour wear liquid lipstick available at Minsah Beauty',
    },
  });

  const mascara1 = await prisma.product.upsert({
    where: { sku: 'MAY-EYE-001' },
    update: {},
    create: {
      sku: 'MAY-EYE-001',
      name: 'Maybelline Lash Sensational Sky High Mascara',
      slug: 'maybelline-sky-high-mascara',
      description: 'Volumizing and lengthening mascara with bamboo extract and fibers for limitless length.',
      shortDescription: 'Sky-high volume and length mascara',
      price: 1100,
      compareAtPrice: 1500,
      costPrice: 750,
      quantity: 180,
      lowStockThreshold: 12,
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      isNew: true,
      categoryId: eyes.id,
      brandId: brands[4].id, // Maybelline
    },
  });

  const foundation1 = await prisma.product.upsert({
    where: { sku: 'LOR-FACE-001' },
    update: {},
    create: {
      sku: 'LOR-FACE-001',
      name: "L'Oréal Paris Infallible 24H Fresh Wear Foundation",
      slug: 'loreal-infallible-24h-foundation',
      description: 'Full coverage foundation with 24-hour wear. Lightweight, breathable formula with SPF 18.',
      shortDescription: '24-hour full coverage foundation',
      price: 1650,
      compareAtPrice: 2200,
      costPrice: 1200,
      quantity: 120,
      lowStockThreshold: 10,
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      categoryId: face.id,
      brandId: brands[5].id, // L'Oréal
    },
  });

  // Foundation variants (different shades)
  await prisma.productVariant.createMany({
    data: [
      {
        productId: foundation1.id,
        sku: 'LOR-FACE-001-IVORY',
        name: 'Ivory',
        price: 1650,
        quantity: 40,
        attributes: { shade: 'Ivory', shadeNumber: '110' },
      },
      {
        productId: foundation1.id,
        sku: 'LOR-FACE-001-NATURAL',
        name: 'Natural Beige',
        price: 1650,
        quantity: 50,
        attributes: { shade: 'Natural Beige', shadeNumber: '130' },
      },
      {
        productId: foundation1.id,
        sku: 'LOR-FACE-001-SAND',
        name: 'Sand',
        price: 1650,
        quantity: 30,
        attributes: { shade: 'Sand', shadeNumber: '140' },
      },
    ],
    skipDuplicates: true,
  });

  const garnier1 = await prisma.product.upsert({
    where: { sku: 'GAR-SKIN-001' },
    update: {},
    create: {
      sku: 'GAR-SKIN-001',
      name: 'Garnier Skin Naturals Light Complete Vitamin C Serum',
      slug: 'garnier-vitamin-c-serum',
      description: 'Brightening serum with Vitamin C to reduce dark spots and even skin tone. Suitable for all skin types.',
      shortDescription: 'Vitamin C brightening serum',
      price: 650,
      compareAtPrice: 900,
      costPrice: 450,
      quantity: 220,
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      isNew: true,
      categoryId: skincare.id,
      brandId: brands[6].id, // Garnier
    },
  });

  const garnier2 = await prisma.product.upsert({
    where: { sku: 'GAR-SKIN-002' },
    update: {},
    create: {
      sku: 'GAR-SKIN-002',
      name: 'Garnier Micellar Cleansing Water',
      slug: 'garnier-micellar-water',
      description: 'All-in-1 cleanser and makeup remover. No rinse needed. Suitable for sensitive skin.',
      shortDescription: 'All-in-1 micellar cleansing water',
      price: 550,
      compareAtPrice: 750,
      costPrice: 350,
      quantity: 300,
      trackInventory: true,
      isActive: true,
      isFeatured: true,
      categoryId: skincare.id,
      brandId: brands[6].id, // Garnier
    },
  });

  console.log('✅ Products created');

  // ==========================================
  // 5. Test Customers
  // ==========================================
  console.log('👥 Creating test customers...');

  const customerPassword = await bcrypt.hash('Customer@123', 10);

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      email: 'customer1@example.com',
      emailVerified: new Date(),
      passwordHash: customerPassword,
      firstName: 'Ayesha',
      lastName: 'Rahman',
      phone: '+8801711111111',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      loyaltyPoints: 150,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      email: 'customer2@example.com',
      emailVerified: new Date(),
      passwordHash: customerPassword,
      firstName: 'Fatima',
      lastName: 'Khan',
      phone: '+8801722222222',
      role: UserRole.VIP,
      status: UserStatus.ACTIVE,
      loyaltyPoints: 500,
    },
  });

  console.log('✅ Test customers created');

  // ==========================================
  // 6. Addresses
  // ==========================================
  console.log('📍 Creating addresses...');

  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id,
        type: AddressType.SHIPPING,
        isDefault: true,
        firstName: 'Ayesha',
        lastName: 'Rahman',
        street1: 'House 45, Road 12',
        street2: 'Dhanmondi',
        city: 'Dhaka',
        state: 'Dhaka Division',
        postalCode: '1209',
        country: 'Bangladesh',
        phone: '+8801711111111',
      },
      {
        userId: customer2.id,
        type: AddressType.SHIPPING,
        isDefault: true,
        firstName: 'Fatima',
        lastName: 'Khan',
        street1: 'Plot 88, Gulshan Avenue',
        city: 'Dhaka',
        state: 'Dhaka Division',
        postalCode: '1212',
        country: 'Bangladesh',
        phone: '+8801722222222',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Addresses created');

  // ==========================================
  // 7. Coupons (Your coupons + Additional)
  // ==========================================
  console.log('🎟️  Creating coupons...');

  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: 'Welcome discount for new customers',
        type: CouponType.PERCENTAGE,
        value: 10,
        minPurchase: 500,
        usageLimit: 1000,
        usageCount: 0,
        perUserLimit: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'FREESHIP',
        description: 'Free shipping on orders over 1000 BDT',
        type: CouponType.FREE_SHIPPING,
        value: 0,
        minPurchase: 1000,
        usageLimit: null,
        usageCount: 0,
        isActive: true,
      },
      {
        code: 'SAVE200',
        description: 'Save 200 BDT on orders above 3000',
        type: CouponType.FIXED,
        value: 200,
        minPurchase: 3000,
        usageLimit: 500,
        usageCount: 0,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Coupons created');

  // ==========================================
  // 8. Reviews
  // ==========================================
  console.log('⭐ Creating product reviews...');

  await prisma.review.createMany({
    data: [
      {
        userId: customer1.id,
        productId: lipstick1.id,
        rating: 5,
        title: 'Perfect red shade!',
        comment: 'This is my go-to red lipstick. The color is vibrant and stays for hours without drying my lips.',
        isVerified: true,
        isApproved: true,
      },
      {
        userId: customer2.id,
        productId: mascara1.id,
        rating: 5,
        title: 'Amazing volume!',
        comment: 'Best mascara I\'ve ever used! My lashes look so long and full. Highly recommended!',
        isVerified: true,
        isApproved: true,
      },
      {
        userId: customer1.id,
        productId: product1.id, // Minsah Beauty Hydrating Serum
        rating: 5,
        title: 'Love this serum!',
        comment: 'My skin feels so hydrated and soft. Been using Minsah Beauty products for months now!',
        isVerified: true,
        isApproved: true,
      },
      {
        userId: customer2.id,
        productId: garnier1.id,
        rating: 4,
        title: 'Good serum for daily use',
        comment: 'Nice product! Noticed my skin getting brighter after 2 weeks of use.',
        isVerified: true,
        isApproved: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Reviews created');

  console.log('');
  console.log('🎉 Minsah Beauty database seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Admin users: 2`);
  console.log(`   - Brands: 7 (Minsah Beauty + 6 others)`);
  console.log(`   - Categories: 11 (8 main + 3 subcategories)`);
  console.log(`   - Products: 10 (3 Minsah Beauty + 7 other brands)`);
  console.log(`   - Customers: 2`);
  console.log(`   - Addresses: 2`);
  console.log(`   - Coupons: 3`);
  console.log(`   - Reviews: 4`);
  console.log('');
  console.log('🔐 Login credentials:');
  console.log('   Super Admin: admin@minsahbeauty.cloud / ChangeThisPassword123!');
  console.log('   Manager: manager@minsahbeauty.cloud / ChangeThisPassword123!');
  console.log('   Customer: customer1@example.com / Customer@123');
  console.log('');
  console.log('⚠️  IMPORTANT: Change admin password immediately after first login!');
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });