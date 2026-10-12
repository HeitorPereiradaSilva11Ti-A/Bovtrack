-- =====================================================================
-- BovTrack - banco de dados (MySQL 8 / MariaDB 10.4+)
-- Funciona no XAMPP (phpMyAdmin), na Hostinger, no Aiven e no TiDB Cloud.
--
-- Como usar:
--   phpMyAdmin: aba "Importar" -> escolher este arquivo -> Executar
--   Terminal:   mysql -u root -p < banco.sql
--
-- Na Hostinger o banco ja vem criado (ex.: u123456789_bovtrack) e o
-- usuario nao tem permissao de CREATE DATABASE: nesse caso apague as
-- duas linhas abaixo (CREATE DATABASE / USE) e importe com o banco
-- selecionado no phpMyAdmin.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS bovtrack
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bovtrack;

-- ---------------------------------------------------------------------
-- usuarios: donos dos animais (telas login.html e cadastro.html)
-- A senha NUNCA e salva em texto puro: o backend grava o hash (bcrypt).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- bovinos: animais cadastrados pelo dono
-- raca define o limite do ambiente: zebuina = 35 C, europeia = 27 C
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bovinos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  nome        VARCHAR(100) NOT NULL,
  brinco      VARCHAR(50)  NULL,          -- numero de identificacao do animal
  raca        ENUM('zebuina', 'europeia') NOT NULL DEFAULT 'zebuina',
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bovinos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  UNIQUE KEY uq_bovinos_brinco (usuario_id, brinco)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- leituras: media de X leituras enviada pela central (POST /api/leituras)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leituras (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bovino_id      INT UNSIGNED  NOT NULL,
  temp_animal    DECIMAL(4,1)  NOT NULL,   -- C, objeto do MLX90614
  temp_ambiente  DECIMAL(4,1)  NOT NULL,   -- C, sensor do MLX90614
  sons           SMALLINT UNSIGNED NOT NULL DEFAULT 0,  -- vocalizacoes no periodo
  ventilador     BOOLEAN       NOT NULL DEFAULT FALSE,  -- rele ligado?
  criado_em      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_leituras_bovino FOREIGN KEY (bovino_id)
    REFERENCES bovinos (id) ON DELETE CASCADE,
  KEY idx_leituras_bovino_data (bovino_id, criado_em)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Dados de exemplo para testar o site sem o hardware ligado.
-- Senha do usuario de teste: bovtrack123 (hash bcrypt abaixo)
-- Pode apagar este bloco quando for usar de verdade.
-- ---------------------------------------------------------------------
INSERT IGNORE INTO usuarios (id, email, senha_hash) VALUES
  (1, 'teste@bovtrack.com', '$2b$10$0zziSQTRn4chmxLjMyi/NulMNiVxO82Lot0d6P2K9F2sTlr6Qx692');

INSERT IGNORE INTO bovinos (id, usuario_id, nome, brinco, raca) VALUES
  (1, 1, 'Mimosa', '001', 'zebuina');

INSERT IGNORE INTO leituras (id, bovino_id, temp_animal, temp_ambiente, sons, ventilador) VALUES
  (1, 1, 38.4, 30.2, 0, FALSE),
  (2, 1, 38.9, 33.1, 1, FALSE),
  (3, 1, 39.2, 35.4, 4, TRUE);
