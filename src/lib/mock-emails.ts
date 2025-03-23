import { generateMD5Hash } from './crypto-utils';
import { Email } from './email-service';
import { generateUniqueId } from './email-utils';

// Personagens de Family Guy para os emails fictícios
const familyGuyCharacters = [
  { name: "Peter Griffin", email: "peter@familyguy.com" },
  { name: "Lois Griffin", email: "lois@familyguy.com" },
  { name: "Stewie Griffin", email: "stewie@worlddomination.com" },
  { name: "Brian Griffin", email: "brian@aspiring-writer.com" },
  { name: "Chris Griffin", email: "chris@school.edu" },
  { name: "Meg Griffin", email: "meg@ignored.net" },
  { name: "Quagmire", email: "giggity@alright.com" },
  { name: "Cleveland Brown", email: "cleveland@deli.org" },
  { name: "Joe Swanson", email: "joe@police.gov" },
  { name: "Pai Ausente", email: "foicomprarcigarros@nunca.volto" },
  { name: "Juiz da Pensão", email: "juiz@pensaoalimenticia.gov.br" },
  { name: "Mãe Solteira", email: "criei.sozinha@batalha.com" },
  { name: "INSS", email: "beneficio@pensao.gov.br" },
  { name: "Detetive Particular", email: "encontro.seu.pai@investigacao.com" }
];

// Assuntos relacionados à paternidade ausente
const paternalSubjects = [
  "Ei, lembra daquela vez que...",
  "VITÓRIA! Finalmente consegui dominar o mundo!",
  "Giggity Giggity Goo!",
  "Preciso de sua ajuda para uma missão secreta",
  "Reunião no Bar do Bêbado Tarado",
  "Meu novo romance - Primeira versão",
  "Meg, você está despedida da família",
  "Vamos fazer algo estúpido e perigoso?",
  "RE: Sobre aquele dinheiro da pensão...",
  "Desculpe por perder seu aniversário... de novo",
  "Vou voltar qualquer dia desses, prometo",
  "Novos filhos, nova família, novo eu",
  "Seu padrasto é melhor que eu?",
  "Notificação de Audiência: Pensão Alimentícia",
  "Promoção: Teste de DNA com desconto!",
  "Atualização de cadastro no INSS",
  "Convite: Reunião dos pais na escola",
  "RE: Sua solicitação de pensão foi negada",
  "Como foi seu aniversário? (me lembrei 3 meses depois)",
  "Acabei de ver uma foto sua no Facebook"
];

// Conteúdos de email relacionados à paternidade ausente
const paternalContent = [
  "<p>Ei filho!</p><p>Lembra daquela vez que eu disse que ia comprar cigarro e acabei indo para Vegas? Bons tempos! Enfim, só passando para dizer oi. Não se preocupe, não estou pedindo dinheiro... ainda.</p><p>Ah, e fique longe do frango gigante. Ele está com raiva de novo.</p><p>- Peter (não o seu pai, ele ainda está na fila do cigarro)</p>",
  "<p>Querido súdito,</p><p>Meu plano de dominação mundial está progredindo conforme planejado. Em breve todos se curvarão perante mim, inclusive o idiota do cão e seu pai ausente.</p><p>Prepare-se para a nova ordem mundial.</p><p>Atenciosamente,<br>Stewie Griffin<br>Seu Futuro Soberano</p>",
  "<p>Olá!</p><p>Giggity giggity goo! Acabei de conhecer uma dama incrível no Bar do Bêbado Tarado. Ela disse que gostou do meu... estilo. Acho que pode ser sua mãe!</p><p>Você deveria aparecer qualquer dia desses. Oh! Seu pai não vai, obviamente.</p><p>Giggity,<br>Quagmire</p>",
  "<p>E aí, campeão!</p><p>Só passando para avisar que vou demorar um pouco mais. A fila do cigarro está enorme! Já faz... quantos anos mesmo? 15? Enfim, não me espere para o jantar. Ou para sua formatura. Ou casamento.</p><p>Diga à sua mãe que o cheque está no correio (mentira).</p><p>Um dia eu volto,<br>Seu pai</p>",
  "<p>NOTIFICAÇÃO OFICIAL</p><p>Prezado(a) Senhor(a),</p><p>Informamos que uma ação de pensão alimentícia foi movida contra você. Solicitamos seu comparecimento à audiência marcada para o dia 15/05/2025.</p><p>Caso não compareça, será considerado revel e as alegações serão presumidas como verdadeiras.</p><p>Atenciosamente,<br>Tribunal de Família</p>",
  "<p>E aí, filhão!</p><p>Como vai a vida? A minha está ótima! Tenho uma nova família agora, dois filhos e um cachorro. Não se preocupe, eu também não pago pensão para eles.</p><p>Só queria saber se você joga futebol. Meu novo filho é péssimo nisso.</p><p>Um abraço do seu pai que te ama (quando lembra que você existe)</p>"
];

// Cache de emails gerados para evitar duplicações
const emailCache: Record<string, Email[]> = {};

/**
 * Gera emails fictícios para demonstração
 * 
 * Modificado para ser mais determinístico e usar cache, evitando gerar emails
 * diferentes a cada vez que é chamada para o mesmo endereço
 */
export const generateMockEmails = (email: string): Email[] => {
  // Se já temos emails em cache para este endereço, retornamos eles
  if (emailCache[email]) {
    return emailCache[email];
  }
  
  const emailHash = generateMD5Hash(email).substring(0, 8);
  const numeroDeterministico = parseInt(emailHash, 16);
  
  // Determinar se deve gerar emails (baseado no hash do email para ser consistente)
  const shouldGenerateMockEmails = numeroDeterministico % 100 < 70; // 70% chance
  
  if (!shouldGenerateMockEmails) {
    emailCache[email] = [];
    return [];
  }
  
  // Usar o hash para determinar a quantidade de emails (1-3) de forma consistente
  const numEmails = (Math.floor(numeroDeterministico / 100) % 3) + 1;
  const mockEmails: Email[] = [];

  for (let i = 0; i < numEmails; i++) {
    // Usar índices determinísticos baseados no hash do email
    const characterIndex = (numeroDeterministico + i * 31) % familyGuyCharacters.length;
    const subjectIndex = (numeroDeterministico + i * 17) % paternalSubjects.length;
    const contentIndex = (numeroDeterministico + i * 13) % paternalContent.length;
    
    const character = familyGuyCharacters[characterIndex];
    const subject = paternalSubjects[subjectIndex];
    const content = paternalContent[contentIndex];
    
    // Gerar timestamp baseado no hash para ser consistente
    const minutesAgo = ((numeroDeterministico + i * 7) % 19) + 1; // 1 a 19 minutos atrás
    
    mockEmails.push({
      id: generateUniqueId(),
      from: `${character.name} <${character.email}>`,
      subject: subject,
      preview: content.replace(/<[^>]*>/g, '').substring(0, 80) + "...",
      content: content,
      date: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
      read: false
    });
  }

  // Armazenar os emails gerados em cache
  emailCache[email] = mockEmails;
  
  return mockEmails;
};
