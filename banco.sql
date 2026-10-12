-- =====================================================================
-- BovTrack - banco de dados (MySQL 8 / MariaDB 10.4+)
-- Funciona no XAMPP (phpMyAdmin), na Hostinger, no Aiven e no TiDB Cloud.
-- Montado a partir das telas do Figma (Cadastro, Registros, Registro
-- animal, Dados de temperatura e Dados de vocalizacao).
--
-- Como usar:
--   phpMyAdmin: aba "Importar" -> escolher este arquivo -> Executar
--   Terminal:   mysql -u root -p < banco.sql
--
-- Na Hostinger o banco ja vem criado e o usuario nao pode criar outro:
-- nesse caso apague as linhas CREATE DATABASE / USE logo abaixo.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS bovtrack
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bovtrack;

-- ---------------------------------------------------------------------
-- usuarios: telas Cadastro e Login (dono dos animais)
-- A senha nunca e salva em texto puro: o backend grava o hash (bcrypt).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- racas: Nelore, Angus, Senepol, Guzera...
-- limite_ambiente e a temperatura do AMBIENTE em que o ventilador liga
-- (zebuinas 35 C, europeias 27 C).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS racas (
  id               TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome             VARCHAR(50)  NOT NULL,
  limite_ambiente  DECIMAL(4,1) NOT NULL,
  UNIQUE KEY uq_racas_nome (nome)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- bovinos: telas Registros e Registro animal
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bovinos (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT UNSIGNED NOT NULL,
  numero           VARCHAR(20)  NOT NULL,       -- "N 40028922"
  nome             VARCHAR(100) NOT NULL,       -- "Bartolomeu"
  raca_id          TINYINT UNSIGNED NOT NULL,
  data_nascimento  DATE         NULL,           -- a idade ("8 meses") e calculada
  sexo             ENUM('macho', 'femea') NULL,
  altura_m         DECIMAL(3,2) NULL,           -- 1.76
  peso_arrobas     DECIMAL(5,1) NULL,           -- 15.0
  categoria        ENUM('corte', 'leite') NULL,
  imagem           VARCHAR(255) NULL,           -- caminho da imagem do animal
  criado_em        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bovinos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_bovinos_raca FOREIGN KEY (raca_id) REFERENCES racas (id),
  UNIQUE KEY uq_bovinos_numero (usuario_id, numero)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- vacinas: lista do Registro animal. As de usuario_id NULL sao as padrao
-- (aparecem para todos); "Adicionar vacina" cria uma com o id do dono.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vacinas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NULL,
  nome        VARCHAR(100) NOT NULL,
  CONSTRAINT fk_vacinas_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- bovino_vacinas: quais vacinas cada animal ja tomou (caixinha marcada)
CREATE TABLE IF NOT EXISTS bovino_vacinas (
  bovino_id       INT UNSIGNED NOT NULL,
  vacina_id       INT UNSIGNED NOT NULL,
  data_aplicacao  DATE NULL,
  PRIMARY KEY (bovino_id, vacina_id),
  CONSTRAINT fk_bv_bovino FOREIGN KEY (bovino_id)
    REFERENCES bovinos (id) ON DELETE CASCADE,
  CONSTRAINT fk_bv_vacina FOREIGN KEY (vacina_id)
    REFERENCES vacinas (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- leituras: enviadas pela central (POST /api/leituras). Alimentam as telas
-- Dados de temperatura / vocalizacao ("Agora", "Media", Hoje e Ontem).
-- "Regular/Irregular" e calculado pelo backend com as regras da central.
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
-- Dados fixos: racas e vacinas padrao
-- ---------------------------------------------------------------------
INSERT IGNORE INTO racas (id, nome, limite_ambiente) VALUES
  (1, 'Nelore',  35.0),
  (2, 'Guzerá',  35.0),
  (3, 'Gir',     35.0),
  (4, 'Senepol', 35.0),   -- taurina, mas adaptada ao calor
  (5, 'Angus',   27.0),
  (6, 'Holandesa', 27.0);

INSERT IGNORE INTO vacinas (id, usuario_id, nome) VALUES
  (1, NULL, 'Brucelose (B19/RB51)'),
  (2, NULL, 'Clostridioses'),
  (3, NULL, 'Febre Aftosa'),
  (4, NULL, 'Raiva dos Herbívoros');

-- ---------------------------------------------------------------------
-- Dados de exemplo (os mesmos animais do Figma) para testar o site sem
-- o hardware. Login: teste@bovtrack.com / senha: bovtrack123
-- Pode apagar este bloco quando for usar de verdade.
-- ---------------------------------------------------------------------
INSERT IGNORE INTO usuarios (id, nome, email, senha_hash) VALUES
  (1, 'Usuário Teste', 'teste@bovtrack.com', '$2b$10$0zziSQTRn4chmxLjMyi/NulMNiVxO82Lot0d6P2K9F2sTlr6Qx692');

INSERT IGNORE INTO bovinos
  (id, usuario_id, numero, nome, raca_id, data_nascimento, sexo, altura_m, peso_arrobas, categoria) VALUES
  (1, 1, '40028922', 'Bartolomeu', 1, '2026-02-01', 'macho', 1.76, 15.0, 'corte'),
  (2, 1, '85565927', 'Baltazar IV', 5, NULL, 'macho', NULL, NULL, 'corte'),
  (3, 1, '65524488', 'Genevive', 4, NULL, 'femea', NULL, NULL, 'corte'),
  (4, 1, '40028923', 'Nicolau', 2, NULL, 'macho', NULL, NULL, 'corte');

INSERT IGNORE INTO bovino_vacinas (bovino_id, vacina_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4);

INSERT IGNORE INTO leituras (id, bovino_id, temp_animal, temp_ambiente, sons, ventilador) VALUES
  (1, 1, 38.4, 30.2, 0, FALSE),
  (2, 1, 38.9, 33.1, 1, FALSE),
  (3, 1, 39.2, 35.4, 4, TRUE),
  (4, 2, 38.6, 31.0, 2, FALSE),
  (5, 3, 38.8, 32.5, 1, FALSE),
  (6, 4, 38.5, 31.8, 0, FALSE);
