
-- Este arquivo contém rotinas de limpeza e outras configurações para o Supabase

-- Marcar todos os emails temporários expirados como excluídos
UPDATE temp_emails
SET deleted = TRUE
WHERE expires_at < NOW() AND deleted = FALSE;

-- Excluir mensagens de email que pertencem a emails temporários expirados
DELETE FROM emails
WHERE recipient IN (
  SELECT email FROM temp_emails WHERE deleted = TRUE
);

-- Configurar um job para rodar a função de limpeza diariamente
SELECT cron.schedule(
  'cleanup-expired-emails',  -- Nome do job
  '0 */12 * * *',  -- Executar duas vezes por dia (a cada 12 horas)
  $$
  SELECT cleanup_expired_emails();
  $$
);
