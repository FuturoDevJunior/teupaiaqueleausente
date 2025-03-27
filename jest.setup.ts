import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    nav: 'nav',
    main: 'main',
    footer: 'footer',
    form: 'form',
    button: 'button',
    span: 'span',
    section: 'section',
    article: 'article',
    header: 'header',
    a: 'a',
    ul: 'ul',
    li: 'li',
    ol: 'ol',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  useCycle: jest.fn(() => [false, jest.fn()]),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (_, icon) => {
        return ({ size, className }) => ({
          type: 'svg',
          props: {
            'data-testid': `icon-${String(icon)}`,
            width: size || 24,
            height: size || 24,
            className,
            'aria-hidden': 'true'
          }
        });
      },
    }
  );
});

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
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: () => null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
global.crypto = {
  ...global.crypto,
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
} as Crypto;

// Setup environment variables
process.env.VITE_SUPABASE_URL = 'https://test-supabase-url.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.VITE_ENCRYPTION_KEY = 'test-encryption-key-32-chars-long-xx';

// Mock import.meta.env
interface ImportMeta {
  env: {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    MODE: string;
    [key: string]: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).import = {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://test-supabase-url.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      MODE: 'test',
    },
  },
};

// Mock commonly used components
jest.mock('./src/components/theme/ThemeToggle', () => {
  return {
    __esModule: true,
    default: () => ({
      type: 'div',
      props: { 'data-testid': 'theme-toggle-mock' },
      $$typeof: Symbol.for('react.element')
    })
  };
}, { virtual: true });

jest.mock('./src/components/FamilyGuyQuote', () => {
  return {
    __esModule: true,
    default: () => ({
      type: 'div',
      props: { 'data-testid': 'family-guy-quote-mock' },
      $$typeof: Symbol.for('react.element')
    })
  };
}, { virtual: true });

// Suppress console error during tests
// eslint-disable-next-line @typescript-eslint/no-empty-function
console.error = jest.fn();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 