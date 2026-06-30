// Alternative seed script that tries to work around Prisma edge runtime issue
const { PrismaClient } = require('@prisma/client');

// Try to create Prisma client with explicit engine configuration
// Based on the error, we need to provide either adapter or accelerateUrl
// Since we're using SQLite locally, we should use library engine, not client engine

// Let's try to monkey-patch the config before creating client
// This is a hacky workaround for edge runtime issue

async function main() {
  console.log('🚀 Starting alternative seed script...');
  
  try {
    // Try importing the runtime config directly
    const { getPrismaClient } = require('@prisma/client/runtime/client.js');
    
    // Create a custom config that forces library engine
    const config = {
      "previewFeatures": [],
      "clientVersion": "7.6.0",
      "engineVersion": "75cbdc1eb7150937890ad5465d861175c6624711",
      "activeProvider": "sqlite",
      "datasources": {
        db: {
          url: "file:./dev.db"
        }
      },
      // Try to force library engine
      "engineType": "library"
    };
    
    const PrismaClientCustom = getPrismaClient(config);
    const prisma = new PrismaClientCustom();
    
    console.log('✅ PrismaClient created successfully');
    
    // Test connection
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.chatMessage.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.fee.deleteMany();
    await prisma.event.deleteMany();
    await prisma.complaint.deleteMany();
    await prisma.homework.deleteMany();
    await prisma.result.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.class.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared');
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@school.edu',
        passwordHash: Buffer.from('admin123').toString('base64'),
        role: 'admin',
      },
    });
    
    console.log(`✅ Created admin user: ${adminUser.email}`);
    
    await prisma.$disconnect();
    console.log('🎉 Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();