import '@testing-library/jest-dom';

import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder,
} from 'util';

// Mock global objects
// @ts-expect-error - tipos incompatíveis entre Node e DOM TextEncoder/TextDecoder
global.TextEncoder = NodeTextEncoder;
// @ts-expect-error - tipos incompatíveis entre Node e DOM TextEncoder/TextDecoder
global.TextDecoder = NodeTextDecoder;

// Fix jest.requireActual instead of importActual
// Instead of trying to set global.jest.importActual, we'll mock jest globally
// global.jest.importActual = jest.requireActual; <- This line caused the error
jest.mock('jest-mock', () => ({
  ...jest.requireActual('jest-mock'),
  importActual: jest.requireActual
}));

// Mock import.meta.env for Vite
global.window.process = {
  ...global.window.process,
  env: {
    VITE_SUPABASE_URL: 'https://test-supabase-url.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long-xx',
    NODE_ENV: 'test'
  }
};

// @ts-expect-error - import não existe no tipo globalThis
if (typeof global.import === 'undefined') {
  // @ts-expect-error - import.meta is not available in Jest environment
  global.import = {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://test-supabase-url.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        VITE_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long-xx',
        MODE: 'test'
      }
    }
  };
}

// @ts-expect-error - import não existe no tipo globalThis
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://test-supabase-url.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        VITE_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long-xx',
        MODE: 'test'
      }
    }
  },
  writable: true
});

// Mock objects that aren't available in JSDOM
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock window.print
window.print = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Instead of mocking crypto.randomUUID, let's create a mock implementation
// that we can use throughout our tests
global.crypto = {
  ...global.crypto,
  // Create a function that returns a fixed UUID
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
} as Crypto; 