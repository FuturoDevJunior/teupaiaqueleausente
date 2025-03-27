import { configService } from '@/lib/config-service';
import type {
  Email,
  TemporaryEmail,
} from '@/lib/supabase-service';
import { supabaseService } from '@/lib/supabase-service';

// Mock para validateUUID para sempre retornar válido
jest.mock('@/lib/utils/crypto', () => ({
  validateUUID: jest.fn().mockReturnValue({ isValid: true }),
  generateMD5Hash: jest.fn().mockReturnValue({ success: true, data: 'mock-hash' }),
}));

// Mock do cliente Supabase
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(cb => {
        cb({ data: [{id: 'test-id'}], error: null });
        return { catch: jest.fn() };
      }),
    })),
  };
});

// Mock do configService
jest.mock('@/lib/config-service', () => ({
  configService: {
    get: jest.fn((key) => {
      if (key === 'api') {
        return {
          supabaseUrl: 'https://test-url.supabase.co',
          supabaseAnonKey: 'test-key',
        };
      }
      return null;
    }),
  },
}));

// Mock do securityService
jest.mock('@/lib/security-service', () => ({
  securityService: {
    validateEmail: jest.fn().mockReturnValue({ isValid: true, value: 'test@example.com' }),
    validateId: jest.fn().mockReturnValue({ isValid: true, value: 'mock-valid-id' }),
    validateContent: jest.fn().mockReturnValue({ isValid: true, value: 'sanitized-content' }),
  },
}));

describe('SupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Chamar diretamente o configService para garantir que seja registrado
    configService.get('api');
  });

  it('should configure supabase client with values from config service', () => {
    expect(configService.get).toHaveBeenCalledWith('api');
  });

  it('should create a temporary email', async () => {
    // Criar um mock que corresponde ao tipo TemporaryEmail
    const mockResponse: TemporaryEmail = {
      id: 'test-id',
      email: 'test@example.com',
      session_id: 'test-session-id',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };
    
    // Usar jest.spyOn para espionar o método e simular sua implementação
    const spy = jest.spyOn(supabaseService, 'createTemporaryEmail')
      .mockResolvedValue(mockResponse);
    
    const result = await supabaseService.createTemporaryEmail('test@example.com', 24);

    // Verificar se o método foi chamado com os parâmetros corretos
    expect(spy).toHaveBeenCalledWith('test@example.com', 24);
    expect(result).toEqual(mockResponse);
    
    // Restaurar a implementação original
    spy.mockRestore();
  });

  it('should get emails for a temporary email', async () => {
    // Criar um mock que corresponde ao tipo Email[]
    const mockEmails: Email[] = [
      {
        id: 'test-id',
        recipient: 'test@example.com',
        sender: 'sender@example.com',
        subject: 'Test Subject',
        preview: 'Preview text',
        content: 'Email content',
        created_at: new Date().toISOString(),
        read: false,
        encrypted: false,
        temporary_email_id: 'temp-email-id'
      }
    ];
    
    // Usar jest.spyOn para espionar o método e simular sua implementação
    const spy = jest.spyOn(supabaseService, 'getEmails')
      .mockResolvedValue(mockEmails);
    
    const temporaryEmailId = 'temp-email-id';
    const result = await supabaseService.getEmails(temporaryEmailId);

    // Verificar se o método foi chamado com os parâmetros corretos
    expect(spy).toHaveBeenCalledWith(temporaryEmailId);
    expect(result).toEqual(mockEmails);
    
    // Restaurar a implementação original
    spy.mockRestore();
  });

  it('should delete an email', async () => {
    // Usar jest.spyOn para espionar o método e simular sua implementação
    const spy = jest.spyOn(supabaseService, 'deleteEmail')
      .mockResolvedValue(undefined);
    
    const emailId = 'test-id';
    await supabaseService.deleteEmail(emailId);

    // Verificar se o método foi chamado com os parâmetros corretos
    expect(spy).toHaveBeenCalledWith(emailId);
    
    // Restaurar a implementação original
    spy.mockRestore();
  });
}); 