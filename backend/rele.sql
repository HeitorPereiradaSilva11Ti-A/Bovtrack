-- Rode este arquivo no phpMyAdmin (aba SQL) se a tabela "central" já existia
-- antes do botão do relé. Quem importar o banco.sql do zero não precisa.

ALTER TABLE central
  ADD COLUMN IF NOT EXISTS rele_ate DATETIME NULL;  -- relé ligado pelo site até esta hora (NULL = desligado)
