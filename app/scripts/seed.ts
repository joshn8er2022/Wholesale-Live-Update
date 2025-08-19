
import { PrismaClient, UserRole, PurchaseStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  
  // Create test admin user (hidden from user)
  const adminPassword = await bcrypt.hash('johndoe123', 12)
  const testAdmin = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: adminPassword,
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.ADMIN,
      companyName: 'Hume Health Admin',
    },
  })

  // Create sample admin user
  const adminUserPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminUserPassword,
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
    },
  })

  // Create product categories
  const category1 = await prisma.productCategory.upsert({
    where: { name: 'Wellness Supplements' },
    update: {},
    create: {
      name: 'Wellness Supplements',
      description: 'Health and wellness supplement products',
    },
  })

  const category2 = await prisma.productCategory.upsert({
    where: { name: 'Medical Devices' },
    update: {},
    create: {
      name: 'Medical Devices',
      description: 'Medical equipment and devices',
    },
  })

  // Create product schemes
  const product1 = await prisma.productScheme.upsert({
    where: { sku: 'WELLNESS-001' },
    update: {},
    create: {
      sku: 'WELLNESS-001',
      title: 'Premium Vitamin D3 - 5000 IU',
      description: 'High-potency vitamin D3 supplement for bone health and immune support',
      shopifyProductId: '12345678901',
      shopifyVariantId: '12345678902',
      unitPrice: 29.99,
      bulkPrice: 19.99,
      minimumBulkQty: 50,
      maxUnitsPerLink: 5,
      categoryId: category1.id,
      tags: ['vitamin-d', 'bone-health', 'immune-support'],
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    },
  })

  const product2 = await prisma.productScheme.upsert({
    where: { sku: 'WELLNESS-002' },
    update: {},
    create: {
      sku: 'WELLNESS-002',
      title: 'Omega-3 Fish Oil Complex',
      description: 'Premium omega-3 fatty acids for heart and brain health',
      shopifyProductId: '12345678903',
      shopifyVariantId: '12345678904',
      unitPrice: 39.99,
      bulkPrice: 24.99,
      minimumBulkQty: 25,
      maxUnitsPerLink: 3,
      categoryId: category1.id,
      tags: ['omega-3', 'heart-health', 'brain-health'],
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    },
  })

  const product3 = await prisma.productScheme.upsert({
    where: { sku: 'MEDICAL-001' },
    update: {},
    create: {
      sku: 'MEDICAL-001',
      title: 'Digital Blood Pressure Monitor',
      description: 'Professional-grade digital blood pressure monitoring device',
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

  // Create sample bulk purchases for clients
  const bulkPurchase1 = await prisma.bulkPurchase.create({
    data: {
      userId: client1.id,
      shopifyOrderId: 'SP_001_2024_001',
      shopifyOrderNumber: '#1001',
      productSku: 'WELLNESS-001',
      productTitle: 'Premium Vitamin D3 - 5000 IU',
      productId: '12345678901',
      variantId: '12345678902',
      quantityPurchased: 100,
      quantityRemaining: 85,
      unitCost: 19.99,
      totalCost: 1999.00,
      customerName: 'Dr. Sarah Johnson',
      customerEmail: 'client1@example.com',
      billingName: 'Johnson Medical Practice',
      billingAddress: '123 Medical Center Dr, New York, NY 10001',
      shippingName: 'Dr. Sarah Johnson',
      shippingAddress: '123 Medical Center Dr, New York, NY 10001',
      orderDate: new Date('2024-01-15'),
      discountCode: 'PATIENT_VIT_D3_001',
      customLink: 'https://humeheath-partner.myshopify.com/discount/PATIENT_VIT_D3_001',
    },
  })

  const bulkPurchase2 = await prisma.bulkPurchase.create({
    data: {
      userId: client2.id,
      shopifyOrderId: 'SP_002_2024_001',
      shopifyOrderNumber: '#1002',
      productSku: 'WELLNESS-002',
      productTitle: 'Omega-3 Fish Oil Complex',
      productId: '12345678903',
      variantId: '12345678904',
      quantityPurchased: 50,
      quantityRemaining: 42,
      unitCost: 24.99,
      totalCost: 1249.50,
      customerName: 'Dr. Michael Chen',
      customerEmail: 'client2@example.com',
      billingName: 'Chen Family Medicine',
      billingAddress: '456 Healthcare Ave, Los Angeles, CA 90210',
      shippingName: 'Dr. Michael Chen',
      shippingAddress: '456 Healthcare Ave, Los Angeles, CA 90210',
      orderDate: new Date('2024-02-01'),
      discountCode: 'PATIENT_OMEGA_3_001',
      customLink: 'https://humeheath-partner.myshopify.com/discount/PATIENT_OMEGA_3_001',
    },
  })

  // Create patient links
  const patientLink1 = await prisma.patientLink.create({
    data: {
      userId: client1.id,
      bulkPurchaseId: bulkPurchase1.id,
      productSchemeId: product1.id,
      linkToken: 'patient_link_token_001',
      customUrl: 'https://humeheath-partner.myshopify.com/patient/patient_link_token_001',
      discountCode: 'PATIENT_VIT_D3_001',
      maxUses: 5,
      currentUses: 2,
      patientEmail: 'patient1@example.com',
      patientName: 'John Smith',
    },
  })

  const patientLink2 = await prisma.patientLink.create({
    data: {
      userId: client2.id,
      bulkPurchaseId: bulkPurchase2.id,
      productSchemeId: product2.id,
      linkToken: 'patient_link_token_002',
      customUrl: 'https://humeheath-partner.myshopify.com/patient/patient_link_token_002',
      discountCode: 'PATIENT_OMEGA_3_001',
      maxUses: 3,
      currentUses: 1,
      patientEmail: 'patient2@example.com',
      patientName: 'Jane Doe',
    },
  })

  // Create sample patient fulfillments
  await prisma.patientFulfillment.create({
    data: {
      patientLinkId: patientLink1.id,
      bulkPurchaseId: bulkPurchase1.id,
      shopifyOrderId: 'PATIENT_001',
      patientEmail: 'patient1@example.com',
      patientName: 'John Smith',
      quantityFulfilled: 2,
      fulfillmentDate: new Date('2024-01-20'),
      ipAddress: '192.168.1.100',
    },
  })

  await prisma.patientFulfillment.create({
    data: {
      patientLinkId: patientLink2.id,
      bulkPurchaseId: bulkPurchase2.id,
      shopifyOrderId: 'PATIENT_002',
      patientEmail: 'patient2@example.com',
      patientName: 'Jane Doe',
      quantityFulfilled: 1,
      fulfillmentDate: new Date('2024-02-05'),
      ipAddress: '192.168.1.101',
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log(`👤 Created admin user: ${adminUser.email}`)
  console.log(`👥 Created ${2} client users`)
  console.log(`📦 Created ${3} product schemes`)
  console.log(`🛒 Created ${2} bulk purchases`)
  console.log(`🔗 Created ${2} patient links`)
  console.log(`📋 Created ${2} patient fulfillments`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
