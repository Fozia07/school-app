// Test importing PrismaClient directly from generated client
const { PrismaClient } = require('./node_modules/.prisma/client');

async function test() {
  console.log('Testing direct import...');
  
  try {
    const prisma = new PrismaClient({});
    console.log('✅ PrismaClient created');
    
    const count = await prisma.user.count();
    console.log(`✅ User count: ${count}`);
    
    await prisma.$disconnect();
    console.log('✅ Test passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();