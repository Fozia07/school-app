const { PrismaClient } = require('@prisma/client');

async function test() {
  console.log('Testing PrismaClient...');
  
  try {
    // Try with empty object
    const prisma = new PrismaClient({});
    console.log('✅ PrismaClient created with {}');
    
    // Try a simple query
    const count = await prisma.user.count();
    console.log(`✅ User count: ${count}`);
    
    await prisma.$disconnect();
    console.log('✅ Test passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

test();