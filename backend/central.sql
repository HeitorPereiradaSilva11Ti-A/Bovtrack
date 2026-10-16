-- Rode este arquivo no phpMyAdmin (aba SQL) se o banco já existia antes
-- da tabela "central". Quem importar o banco.sql do zero não precisa.

-- ---------------------------------------------------------------------
-- central: qual animal a central (ESP) está monitorando agora
-- (uma linha só; escolhido pelo site no botão "Monitorar com a central")
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS central (
  id         TINYINT UNSIGNED PRIMARY KEY,
  bovino_id  INT UNSIGNED NULL,
  rele_ate   DATETIME NULL,   -- relé ligado pelo site até esta hora (NULL = desligado)
  CONSTRAINT fk_central_bovino FOREIGN KEY (bovino_id)
    REFERENCES bovinos (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO central (id, bovino_id) VALUES (1, NULL);
