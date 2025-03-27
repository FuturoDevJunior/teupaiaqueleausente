// Mock de import.meta.env para testes Jest
module.exports = {
  VITE_SUPABASE_URL: 'https://test-supabase-url.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long-xx',
  MODE: 'test'
}; 