// Test importing from @prisma/client/default
const { PrismaClient } = require('@prisma/client/default');

async function test() {
  console.log('Testing @prisma/client/default import...');
  
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