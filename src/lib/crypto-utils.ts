
import CryptoJS from "crypto-js";

// Chave de criptografia mais forte com a temática "Teu Pai ausente"
const ENCRYPTION_KEY = "teupai_ausente_super_encryption_key_2025_v3";

/**
 * Criptografa um texto usando AES
 */
export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * Descriptografa um texto criptografado com AES
 */
export const decrypt = (ciphertext: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Erro ao descriptografar:", error);
    return "";
  }
};

/**
 * Verifica se uma string é vazia ou nula
 */
export const isNullOrEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim() === '';
};

/**
 * Gera um hash MD5 de uma string
 */
export const generateMD5Hash = (text: string): string => {
  return CryptoJS.MD5(text).toString();
};

/**
 * Gera um ID de sessão aleatório
 */
export const generateSessionId = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};
