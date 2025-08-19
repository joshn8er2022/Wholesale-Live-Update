
import { PrismaClient, UserRole, PurchaseStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')
  
  // Create admin users
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@humehealth.com' },
    update: {},
    create: {
      email: 'admin@humehealth.com',
      password: adminPassword,
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      companyName: 'Hume Health',
    },
  })

  // Create sample client users
  const clientPassword = await bcrypt.hash('client123', 12)
  const client1 = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      email: 'client1@example.com',
      password: clientPassword,
      name: 'Dr. Sarah Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.CLIENT,
      companyName: 'Johnson Medical Practice',
      address: '123 Medical Center Dr',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '555-0101',
    },
  })

  const client2 = await prisma.user.upsert({
    where: { email: 'client2@example.com' },
    update: {},
    create: {
      email: 'client2@example.com',
      password: clientPassword,
      name: 'Dr. Michael Chen',
      firstName: 'Michael',
      lastName: 'Chen',
      role: UserRole.CLIENT,
      companyName: 'Chen Family Medicine',
      address: '456 Healthcare Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      phone: '555-0102',
    },
  })

  // Create product categories
  const category1 = await prisma.productCategory.upsert({
    where: { name: 'Supplements' },
    update: {},
    create: {
      name: 'Supplements',
      description: 'Nutritional supplements and vitamins',
    },
  })

  const category2 = await prisma.productCategory.upsert({
    where: { name: 'Medical Devices' },
    update: {},
    create: {
      name: 'Medical Devices',
      description: 'Medical equipment and monitoring devices',
    },
  })

  // Create product schemes
  const product1 = await prisma.productScheme.upsert({
    where: { sku: 'VIT-D3-5000' },
    update: {},
    create: {
      sku: 'VIT-D3-5000',
      title: 'Vitamin D3 5000 IU',
      description: 'High-potency vitamin D3 supplement for bone health and immune support',
      shopifyProductId: '12345678901',
      shopifyVariantId: '12345678902',
      unitPrice: 29.99,
      bulkPrice: 19.99,
      minimumBulkQty: 50,
      maxUnitsPerLink: 1,
      categoryId: category1.id,
      tags: ['vitamin-d', 'bone-health', 'immune-support'],
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    },
  })

  const product2 = await prisma.productScheme.upsert({
    where: { sku: 'OMEGA-3-COMPLEX' },
    update: {},
    create: {
      sku: 'OMEGA-3-COMPLEX',
      title: 'Omega-3 Fish Oil Complex',
      description: 'Premium omega-3 fatty acids for heart and brain health',
      shopifyProductId: '12345678903',
      shopifyVariantId: '12345678904',
      unitPrice: 39.99,
      bulkPrice: 24.99,
      minimumBulkQty: 25,
      maxUnitsPerLink: 2,
      categoryId: category1.id,
      tags: ['omega-3', 'heart-health', 'brain-health'],
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    },
  })

  const product3 = await prisma.productScheme.upsert({
    where: { sku: 'BP-MONITOR-DIGITAL' },
    update: {},
    create: {
      sku: 'BP-MONITOR-DIGITAL',
      title: 'Digital Blood Pressure Monitor',
      description: 'Professional-grade digital blood pressure monitoring device with memory',
      shopifyProductId: '12345678905',
      unitPrice: 89.99,
      bulkPrice: 59.99,
      minimumBulkQty: 10,
      maxUnitsPerLink: 1,
      categoryId: category2.id,
      tags: ['blood-pressure', 'monitoring', 'medical-device'],
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop',
    },
  })

  // Create sample bulk purchases for client1
  const bulkPurchase1 = await prisma.bulkPurchase.create({
    data: {
      userId: client1.id,
      shopifyOrderId: 'ORDER_001_2024',
      shopifyOrderNumber: '#1001',
      productSku: product1.sku,
      productTitle: product1.title,
      productId: product1.shopifyProductId,
      variantId: product1.shopifyVariantId,
      quantityPurchased: 100,
      quantityRemaining: 75,
      unitCost: product1.bulkPrice,
      totalCost: product1.bulkPrice * 100,
      customerName: client1.name || '',
      customerEmail: client1.email,
      billingName: client1.name,
      billingAddress: `${client1.address}, ${client1.city}, ${client1.state} ${client1.zip}`,
      shippingName: client1.name,
      shippingAddress: `${client1.address}, ${client1.city}, ${client1.state} ${client1.zip}`,
      orderDate: new Date('2024-01-15'),
      status: PurchaseStatus.ACTIVE,
    },
  })

  const bulkPurchase2 = await prisma.bulkPurchase.create({
    data: {
      userId: client1.id,
      shopifyOrderId: 'ORDER_002_2024',
      shopifyOrderNumber: '#1002',
      productSku: product2.sku,
      productTitle: product2.title,
      productId: product2.shopifyProductId,
      variantId: product2.shopifyVariantId,
      quantityPurchased: 60,
      quantityRemaining: 40,
      unitCost: product2.bulkPrice,
      totalCost: product2.bulkPrice * 60,
      customerName: client1.name || '',
      customerEmail: client1.email,
      billingName: client1.name,
      billingAddress: `${client1.address}, ${client1.city}, ${client1.state} ${client1.zip}`,
      shippingName: client1.name,
      shippingAddress: `${client1.address}, ${client1.city}, ${client1.state} ${client1.zip}`,
      orderDate: new Date('2024-02-01'),
      status: PurchaseStatus.ACTIVE,
    },
  })

  // Create bulk purchase for client2
  const bulkPurchase3 = await prisma.bulkPurchase.create({
    data: {
      userId: client2.id,
      shopifyOrderId: 'ORDER_003_2024',
      shopifyOrderNumber: '#1003',
      productSku: product3.sku,
      productTitle: product3.title,
      productId: product3.shopifyProductId,
      quantityPurchased: 25,
      quantityRemaining: 18,
      unitCost: product3.bulkPrice,
      totalCost: product3.bulkPrice * 25,
      customerName: client2.name || '',
      customerEmail: client2.email,
      billingName: client2.name,
      billingAddress: `${client2.address}, ${client2.city}, ${client2.state} ${client2.zip}`,
      shippingName: client2.name,
      shippingAddress: `${client2.address}, ${client2.city}, ${client2.state} ${client2.zip}`,
      orderDate: new Date('2024-01-28'),
      status: PurchaseStatus.ACTIVE,
    },
  })

  // Create patient links with realistic tokens
  const linkToken1 = randomBytes(32).toString('hex')
  const discountCode1 = `HUME-${randomBytes(8).toString('hex').toUpperCase()}`
  const patientLink1 = await prisma.patientLink.create({
    data: {
      userId: client1.id,
      bulkPurchaseId: bulkPurchase1.id,
      productSchemeId: product1.id,
      linkToken: linkToken1,
      customUrl: `patient/${linkToken1}`,
      discountCode: discountCode1,
      maxUses: 1,
      currentUses: 0,
      isActive: true,
      patientEmail: 'john.smith@email.com',
      patientName: 'John Smith',
      notes: 'Vitamin D deficiency - referred by Dr. Johnson',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  const linkToken2 = randomBytes(32).toString('hex')
  const discountCode2 = `HUME-${randomBytes(8).toString('hex').toUpperCase()}`
  const patientLink2 = await prisma.patientLink.create({
    data: {
      userId: client1.id,
      bulkPurchaseId: bulkPurchase2.id,
      productSchemeId: product2.id,
      linkToken: linkToken2,
      customUrl: `patient/${linkToken2}`,
      discountCode: discountCode2,
      maxUses: 1,
      currentUses: 1, // This one has been used
      isActive: true,
      patientEmail: 'jane.doe@email.com',
      patientName: 'Jane Doe',
      notes: 'Cardiovascular health support - preventive care',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  const linkToken3 = randomBytes(32).toString('hex')
  const discountCode3 = `HUME-${randomBytes(8).toString('hex').toUpperCase()}`
  const patientLink3 = await prisma.patientLink.create({
    data: {
      userId: client2.id,
      bulkPurchaseId: bulkPurchase3.id,
      productSchemeId: product3.id,
      linkToken: linkToken3,
      customUrl: `patient/${linkToken3}`,
      discountCode: discountCode3,
      maxUses: 1,
      currentUses: 0,
      isActive: true,
      patientEmail: 'robert.wilson@email.com',
      patientName: 'Robert Wilson',
      notes: 'Hypertension monitoring - home care',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Create sample patient fulfillment for the used link
  await prisma.patientFulfillment.create({
    data: {
      patientLinkId: patientLink2.id,
      bulkPurchaseId: bulkPurchase2.id,
      patientEmail: 'jane.doe@email.com',
      patientName: 'Jane Doe',
      quantityFulfilled: 2,
      fulfillmentDate: new Date('2024-02-15'),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('🔐 Login Credentials:')
  console.log(`   Admin: admin@humehealth.com / admin123`)
  console.log(`   Client 1: client1@example.com / client123`)
  console.log(`   Client 2: client2@example.com / client123`)
  console.log('')
  console.log('📊 Created Data:')
  console.log(`   - 1 Admin user`)
  console.log(`   - 2 Client users`)
  console.log(`   - 2 Product categories`)
  console.log(`   - 3 Product schemes`)
  console.log(`   - 3 Bulk purchases`)
  console.log(`   - 3 Patient links`)
  console.log(`   - 1 Patient fulfillment`)
  console.log('')
  console.log('🔗 Test Patient Links:')
  console.log(`   - Active (John Smith): http://localhost:3000/patient/${linkToken1}`)
  console.log(`   - Used (Jane Doe): http://localhost:3000/patient/${linkToken2}`)
  console.log(`   - Active (Robert Wilson): http://localhost:3000/patient/${linkToken3}`)
  console.log('')
  console.log('💡 Test by logging in as a client and creating new patient links!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
