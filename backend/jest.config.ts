import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  //  Match your new folder structure
  testMatch: ['**/tests/**/*.test.ts'],
  
  //  Handle path aliases (e.g., import from '@/services/...')
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  //  Clean up after each test
  clearMocks: true,
  restoreMocks: true,

  //  Coverage reporting
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};

export default config;