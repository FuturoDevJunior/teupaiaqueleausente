// Mock for the Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: jest.fn(callback => Promise.resolve(callback({ data: [], error: null }))),
    data: null,
    error: null
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
    }))
  },
  auth: {
    signUp: jest.fn().mockResolvedValue({}),
    signIn: jest.fn().mockResolvedValue({}),
    signOut: jest.fn().mockResolvedValue({}),
    onAuthStateChange: jest.fn().mockReturnValue({ data: {}, unsubscribe: jest.fn() })
  }
};

// Use module.exports for Jest compatibility
module.exports = {
  supabase: mockSupabase,
  default: { supabase: mockSupabase }
}; 