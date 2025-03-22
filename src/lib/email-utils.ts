
// Lista de adjetivos brasileiros divertidos
const adjetivos = [
  'malandro', 'esperto', 'ligeiro', 'desenrolado', 'descolado', 
  'maneiro', 'bacana', 'legal', 'daora', 'sinistro', 
  'massa', 'bacanudo', 'irado', 'dahora', 'brabo',
  'zica', 'top', 'foda', 'monstro', 'mito',
  'sagaz', 'ninja', 'craque', 'fera', 'animal'
];

// Lista de substantivos brasileiros divertidos
const substantivos = [
  'carioca', 'brasileiro', 'gato', 'leao', 'surfista',
  'mestre', 'campeao', 'rei', 'professor', 'samurai',
  'jogador', 'piloto', 'atacante', 'zagueiro', 'artista',
  'genio', 'astro', 'estrela', 'joia', 'fenomeno',
  'garoto', 'parceiro', 'brother', 'amigo', 'chefe'
];

// Lista de domínios para o email temporário - todos com a temática "Teu Pai aquele ausente"
const dominios = [
  'teupaiausente.com.br',
  'paifoicomprarcigarros.net.br',
  'paiquefoicomprarleite.com.br',
  'esperandonoponto.net.br',
  'voltologo.com.br',
  'foibuscarcigarros.net',
  'seupainaovoltoumais.com.br',
  'paifoicacarleite.com',
  'painaopagapensao.net',
  'paifoipraseletiva.com.br'
];

/**
 * Gera um número aleatório entre min e max (inclusive)
 */
const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Gera um email temporário aleatório baseado em palavras brasileiras
 */
export const generateRandomEmail = (): string => {
  const adjetivo = adjetivos[randomNumber(0, adjetivos.length - 1)];
  const substantivo = substantivos[randomNumber(0, substantivos.length - 1)];
  const numero = randomNumber(10, 999);
  const dominio = dominios[randomNumber(0, dominios.length - 1)];
  
  return `${adjetivo}.${substantivo}${numero}@${dominio}`;
};

/**
 * Verifica se um email está no formato válido
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Gera um ID único para emails
 */
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
