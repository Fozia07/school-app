const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  console.log('Testing PrismaClient initialization...');

  // Test 1: Empty config
  console.log('\nTest 1: Empty config');
  try {
    const prisma1 = new PrismaClient({});
    console.log('✅ PrismaClient created with empty config');
    await prisma1.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: No config
  console.log('\nTest 2: No config');
  try {
    const prisma2 = new PrismaClient();
    console.log('✅ PrismaClient created with no config');
    await prisma2.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: With adapter (edge)
  console.log('\nTest 3: With adapter');
  try {
    const prisma3 = new PrismaClient({
      adapter: {
        queryRaw: () => Promise.resolve([]),
        executeRaw: () => Promise.resolve(0),
        startTransaction: () => Promise.resolve({ commit: () => Promise.resolve(), rollback: () => Promise.resolve() }),
        $metrics: null
      }
    });
    console.log('✅ PrismaClient created with adapter');
    await prisma3.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPrisma();