import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

const esModules = ['lucide-react', 'framer-motion'].join('|');

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^lucide-react$': '<rootDir>/src/__mocks__/lucide-react.js',
    '^lucide-react/dist/esm/icons/(.*)$': '<rootDir>/src/__mocks__/lucide-react.js',
    '^@/integrations/supabase/client$': '<rootDir>/src/__mocks__/supabase-client.js',
    'import\\.meta\\.env': '<rootDir>/src/__mocks__/importMetaEnv.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      }
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: ['@babel/preset-env', '@babel/preset-react'],
    }],
  },
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules})`
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/styles/**',
    '!src/app/**',
    '!**/node_modules/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};

export default config; 