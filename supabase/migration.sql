
-- Criação da tabela para emails temporários
CREATE TABLE IF NOT EXISTS temp_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted BOOLEAN DEFAULT FALSE
);

-- Adicionar índice para otimizar expiração
CREATE INDEX IF NOT EXISTS idx_temp_emails_expires_at ON temp_emails (expires_at);

-- Criação da tabela para armazenar mensagens de email
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Adicionar índice para acelerar busca por destinatário
CREATE INDEX IF NOT EXISTS idx_emails_recipient ON emails (recipient);

-- Função para limpar emails expirados automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_emails()
RETURNS void AS $$
BEGIN
  -- Marcar emails temporários expirados como excluídos
  UPDATE temp_emails
  SET deleted = TRUE
  WHERE expires_at < NOW() AND deleted = FALSE;
  
  -- Excluir mensagens de email que pertencem a emails temporários expirados
  DELETE FROM emails
  WHERE recipient IN (
    SELECT email FROM temp_emails WHERE deleted = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Configurar um trigger para executar periodicamente (usando pgAgent ou similar)
