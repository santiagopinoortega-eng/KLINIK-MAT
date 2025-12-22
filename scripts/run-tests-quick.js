/**
 * Script de Ejecución Rápida de Tests
 * Para desarrollo y CI/CD
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log('cyan', `  ${title}`);
  console.log('='.repeat(70) + '\n');
}

async function runTests() {
  const startTime = Date.now();

  section('🧪 KLINIK-MAT - Suite de Tests Rápidos');

  const testSuites = [
    {
      name: 'Tests Unitarios (Subscription)',
      command: 'npx jest __tests__/lib/subscription.test.ts --passWithNoTests',
      critical: true,
    },
    {
      name: 'Tests de API (check-access)',
      command: 'npx jest __tests__/api/subscription/check-access.test.ts --passWithNoTests',
      critical: true,
    },
    {
      name: 'Tests de Componentes (UsageLimitBadge)',
      command: 'npx jest __tests__/components/UsageLimitBadge.test.tsx --passWithNoTests',
      critical: false,
    },
    {
      name: 'Tests de Performance',
      command: 'npx jest __tests__/performance/load.test.ts --passWithNoTests',
      critical: false,
    },
    {
      name: 'Tests de Integración',
      command: 'npx jest __tests__/integration/full-flow.test.ts --passWithNoTests',
      critical: true,
    },
  ];

  const results = [];
  let failedCritical = false;

  for (const suite of testSuites) {
    section(suite.name);

    try {
      const { stdout, stderr } = await execPromise(suite.command);
      
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);

      log('green', `✓ ${suite.name} - PASÓ`);
      results.push({ name: suite.name, passed: true });
    } catch (error) {
      log('red', `✗ ${suite.name} - FALLÓ`);
      
      if (error.stdout) console.log(error.stdout);
      if (error.stderr) console.error(error.stderr);

      results.push({ name: suite.name, passed: false });

      if (suite.critical) {
        failedCritical = true;
      }
    }
  }

  // Resumen
  section('📊 Resumen de Resultados');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total de suites: ${total}`);
  log('green', `✓ Pasaron: ${passed}`);
  if (failed > 0) {
    log('red', `✗ Fallaron: ${failed}`);
  }

  console.log('\nDetalle:');
  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(color, `  ${icon} ${result.name}`);
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nTiempo total: ${duration}s`);

  if (failedCritical) {
    log('red', '\n❌ Tests críticos fallaron. No se recomienda desplegar.');
    process.exit(1);
  } else if (failed > 0) {
    log('yellow', '\n⚠️  Algunos tests no críticos fallaron.');
    process.exit(0);
  } else {
    log('green', '\n✅ Todos los tests pasaron. Sistema listo para desplegar.');
    process.exit(0);
  }
}

runTests().catch(error => {
  log('red', `\n❌ Error ejecutando tests: ${error.message}`);
  process.exit(1);
});
