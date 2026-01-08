// scripts/test-redis.ts
/**
 * Script de prueba para verificar conexión con Redis (Upstash)
 * 
 * Uso:
 *   ts-node scripts/test-redis.ts
 * 
 * O con npm:
 *   npm run test:redis
 */

import { cache, CACHE_TTL } from '../lib/cache';

async function testRedis() {
  console.log('🧪 Testing Redis Cache...\n');

  try {
    // Test 1: SET
    console.log('1️⃣ Testing SET...');
    const testData = {
      message: 'Hello Redis!',
      timestamp: Date.now(),
      nested: {
        array: [1, 2, 3],
        object: { key: 'value' }
      }
    };
    
    await cache.set('test:key', testData, CACHE_TTL.SHORT);
    console.log('   ✅ SET successful\n');

    // Test 2: GET
    console.log('2️⃣ Testing GET...');
    const retrieved = await cache.get<typeof testData>('test:key');
    
    if (retrieved) {
      console.log('   ✅ GET successful');
      console.log('   Data:', JSON.stringify(retrieved, null, 2));
      console.log('');
    } else {
      console.log('   ❌ GET failed - data is null\n');
      process.exit(1);
    }

    // Test 3: DELETE
    console.log('3️⃣ Testing DELETE...');
    const deleted = await cache.delete('test:key');
    console.log(`   ${deleted ? '✅' : '❌'} DELETE ${deleted ? 'successful' : 'failed'}\n`);

    // Test 4: Verificar que fue eliminado
    console.log('4️⃣ Verifying DELETE...');
    const afterDelete = await cache.get('test:key');
    
    if (afterDelete === null) {
      console.log('   ✅ Key correctly deleted\n');
    } else {
      console.log('   ❌ Key still exists after delete\n');
      process.exit(1);
    }

    // Test 5: Estadísticas
    console.log('5️⃣ Testing STATS...');
    const stats = await cache.stats();
    console.log('   Cache Statistics:');
    console.log(`   - Size: ${stats.size} keys`);
    console.log(`   - Max Entries: ${stats.maxEntries === -1 ? 'unlimited' : stats.maxEntries}`);
    console.log(`   - Hits: ${stats.hits}`);
    console.log(`   - Misses: ${stats.misses}`);
    console.log(`   - Hit Rate: ${stats.hitRate.toFixed(2)}%`);
    console.log('');

    // Test 6: TTL verification
    console.log('6️⃣ Testing TTL expiration...');
    await cache.set('test:ttl', 'expires soon', 2000); // 2 segundos
    console.log('   ⏳ Waiting 3 seconds...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const expired = await cache.get('test:ttl');
    if (expired === null) {
      console.log('   ✅ TTL working correctly - key expired\n');
    } else {
      console.log('   ⚠️  Key still exists after TTL (might be MemoryCache)\n');
    }

    // Resultado final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All Redis tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar si está usando Redis o Memory
    const cacheType = process.env.UPSTASH_REDIS_REST_URL ? 'Redis (Upstash)' : 'Memory (Fallback)';
    console.log(`📊 Cache Type: ${cacheType}`);
    
    if (cacheType.includes('Memory')) {
      console.log('\n💡 Tip: Configure UPSTASH_REDIS_REST_URL to use Redis');
      console.log('   See REDIS_CACHE_SETUP.md for instructions');
    }

  } catch (error) {
    console.error('\n❌ Redis test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar tests
testRedis();
