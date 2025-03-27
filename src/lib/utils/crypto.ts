import CryptoJS from 'crypto-js';
import { z } from 'zod';

import { monitoringService } from '../monitoring-service';

// Schema de validação para entrada de criptografia
const encryptionInputSchema = z.string().min(1).max(50000);

// Interface para resultados de operações criptográficas
interface CryptoResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class CryptoService {
  private static instance: CryptoService;
  private readonly encryptionKey: string;
  
  private constructor() {
    // Obtém a chave de criptografia do ambiente ou usa uma chave padrão forte
    this.encryptionKey = process.env.VITE_ENCRYPTION_KEY || 
      "teupai_ausente_super_encryption_key_2025_v3_with_extra_security";
  }
  
  public static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }
  
  /**
   * Criptografa um texto usando AES-256
   * @param text Texto a ser criptografado
   * @returns Resultado da operação com o texto criptografado ou erro
   */
  public encrypt(text: string): CryptoResult<string> {
    try {
      // Valida a entrada
      const validationResult = encryptionInputSchema.safeParse(text);
      if (!validationResult.success) {
        throw new Error('Invalid input for encryption');
      }
      
      // Adiciona um prefixo aleatório para dificultar ataques de texto conhecido
      const randomPrefix = CryptoJS.lib.WordArray.random(16).toString();
      const textWithPrefix = randomPrefix + text;
      
      // Criptografa usando AES com um salt único por operação
      const salt = CryptoJS.lib.WordArray.random(128/8);
      const key = CryptoJS.PBKDF2(this.encryptionKey, salt, { keySize: 256/32 });
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      const encrypted = CryptoJS.AES.encrypt(textWithPrefix, key, { 
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
      
      // Combine the salt, iv, and ciphertext into a single string
      const encryptedWithParams = salt.toString() + iv.toString() + encrypted.toString();
      return { success: true, data: encryptedWithParams };
    } catch (error) {
      monitoringService.trackError(error as Error, 'CryptoService.encrypt');
      
      // Fallback para método mais simples em caso de erro
      try {
        const simplifiedEncrypted = CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
        return { success: true, data: simplifiedEncrypted };
      } catch (fallbackError) {
        return { 
          success: false, 
          error: 'Failed to encrypt data even with fallback method' 
        };
      }
    }
  }
  
  /**
   * Descriptografa um texto usando AES-256
   * @param ciphertext Texto criptografado
   * @returns Resultado da operação com o texto descriptografado ou erro
   */
  public decrypt(ciphertext: string): CryptoResult<string> {
    try {
      // Valida a entrada
      if (!ciphertext) {
        throw new Error('Invalid input for decryption');
      }
      
      // Tenta descriptografar usando o formato completo primeiro
      try {
        // Extract the salt (first 32 chars), iv (next 32 chars) and actual ciphertext
        if (ciphertext.length > 64) {
          const salt = CryptoJS.enc.Hex.parse(ciphertext.substr(0, 32));
          const iv = CryptoJS.enc.Hex.parse(ciphertext.substr(32, 32));
          const actualCiphertext = ciphertext.substring(64);
          
          const key = CryptoJS.PBKDF2(this.encryptionKey, salt, { keySize: 256/32 });
          const decrypted = CryptoJS.AES.decrypt(actualCiphertext, key, { 
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
          });
          
          const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
          if (decryptedText) {
            // Remove the random prefix (first 32 chars)
            return { success: true, data: decryptedText.substring(32) };
          }
        }
      } catch (advancedError) {
        // Silently fall back to basic decryption
      }
      
      // Fallback para método simples
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Failed to decrypt data');
      }
      
      return { success: true, data: decrypted };
    } catch (error) {
      monitoringService.trackError(error as Error, 'CryptoService.decrypt');
      return { 
        success: false, 
        error: 'Failed to decrypt data' 
      };
    }
  }
  
  /**
   * Gera um hash MD5 de uma string
   * @param text Texto para gerar o hash
   * @returns Hash MD5 do texto ou erro
   */
  public generateMD5Hash(text: string): CryptoResult<string> {
    try {
      if (!text) {
        throw new Error('Invalid input for hash generation');
      }
      
      const hash = CryptoJS.MD5(text).toString();
      return { success: true, data: hash };
    } catch (error) {
      monitoringService.trackError(error as Error, 'CryptoService.generateMD5Hash');
      return { 
        success: false, 
        error: 'Failed to generate hash' 
      };
    }
  }
  
  /**
   * Gera um ID de sessão aleatório e seguro
   * @returns ID de sessão aleatório
   */
  public generateSessionId(): CryptoResult<string> {
    try {
      const sessionId = CryptoJS.lib.WordArray.random(16).toString();
      return { success: true, data: sessionId };
    } catch (error) {
      monitoringService.trackError(error as Error, 'CryptoService.generateSessionId');
      return { 
        success: false, 
        error: 'Failed to generate session ID' 
      };
    }
  }
  
  /**
   * Verifica se uma string é vazia ou nula
   * @param str String a ser verificada
   * @returns true se a string for vazia ou nula
   */
  public isNullOrEmpty(str: string | null | undefined): boolean {
    return !str || str.trim() === '';
  }
}

// Exporta uma instância única do serviço
export const cryptoService = CryptoService.getInstance();

// Exporta funções auxiliares para compatibilidade com o código existente
export const encrypt = (text: string): string => {
  const result = cryptoService.encrypt(text);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data!;
};

export const decrypt = (ciphertext: string): string => {
  const result = cryptoService.decrypt(ciphertext);
  if (!result.success) {
    return '';
  }
  return result.data!;
};

export const generateMD5Hash = (text: string): string => {
  const result = cryptoService.generateMD5Hash(text);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data!;
};

export const generateSessionId = (): string => {
  const result = cryptoService.generateSessionId();
  if (!result.success) {
    // Fallback para crypto.randomUUID() em caso de erro
    return crypto.randomUUID();
  }
  return result.data!;
};

export const isNullOrEmpty = cryptoService.isNullOrEmpty.bind(cryptoService); 