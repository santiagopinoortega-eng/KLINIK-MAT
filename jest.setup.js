// jest.setup.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Asegurar que TypeScript cargue las declaraciones de tipos
/// <reference path="./jest.setup.d.ts" />

// Mock environment variables for tests
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.CLERK_SECRET_KEY = 'sk_test_mock'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

// Mock @vercel/analytics (ESM module que causa problemas en Jest)
jest.mock('@vercel/analytics', () => ({
  track: jest.fn(),
  Analytics: () => null,
}));

jest.mock('@vercel/speed-insights', () => ({
  SpeedInsights: () => null,
}));
