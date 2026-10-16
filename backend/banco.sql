-- =====================================================================
-- BovTrack - banco de dados (MySQL / MariaDB)
--
-- Feito para o banco da hospedagem do startnet (Hostinger), onde o banco
-- já vem criado. Como usar no phpMyAdmin:
--   1. Clique no banco na coluna da esquerda (u377366289_gpsp07)
--   2. Aba "Importar" -> escolha este arquivo -> "Importar"
--
-- Vem só com a estrutura e as listas fixas (raças e vacinas padrão).
-- Os dados reais entram pelo site (cadastro) e pela central (leituras).
-- =====================================================================

-- ---------------------------------------------------------------------
-- usuarios: quem se cadastra no site (dono dos animais)
-- A senha nunca é salva em texto puro, só o hash (password_hash do PHP).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- racas: limite_ambiente é a temperatura do AMBIENTE em que o ventilador
-- liga (zebuínas 35 °C, europeias 27 °C)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS racas (
  id               TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome             VARCHAR(50)  NOT NULL,
  limite_ambiente  DECIMAL(4,1) NOT NULL,
  UNIQUE KEY uq_racas_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- bovinos: animais cadastrados pelo dono (páginas Registros e Registro animal)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bovinos (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT UNSIGNED NOT NULL,
  numero           VARCHAR(20)  NOT NULL,       -- "N° 40028922"
  nome             VARCHAR(100) NOT NULL,
  raca_id          TINYINT UNSIGNED NOT NULL,
  data_nascimento  DATE         NULL,           -- a idade é calculada
  sexo             ENUM('macho', 'femea') NULL,
  altura_m         DECIMAL(3,2) NULL,           -- 1.76
  peso_arrobas     DECIMAL(5,1) NULL,           -- 15.0
  categoria        ENUM('corte', 'leite') NULL,
  imagem           VARCHAR(255) NULL,
  criado_em        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bovinos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_bovinos_raca FOREIGN KEY (raca_id) REFERENCES racas (id),
  UNIQUE KEY uq_bovinos_numero (usuario_id, numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- vacinas: usuario_id NULL = vacina padrão (aparece para todos);
-- "Adicionar vacina" cria uma com o id do dono
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vacinas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NULL,
  nome        VARCHAR(100) NOT NULL,
  CONSTRAINT fk_vacinas_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- bovino_vacinas: quais vacinas cada animal já tomou (caixinhas marcadas)
CREATE TABLE IF NOT EXISTS bovino_vacinas (
  bovino_id  INT UNSIGNED NOT NULL,
  vacina_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (bovino_id, vacina_id),
  CONSTRAINT fk_bv_bovino FOREIGN KEY (bovino_id)
    REFERENCES bovinos (id) ON DELETE CASCADE,
  CONSTRAINT fk_bv_vacina FOREIGN KEY (vacina_id)
    REFERENCES vacinas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- leituras: média das leituras que a central envia (temperatura e som)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leituras (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bovino_id      INT UNSIGNED  NOT NULL,
  temp_animal    DECIMAL(4,1)  NOT NULL,   -- °C, objeto do MLX90614
  temp_ambiente  DECIMAL(4,1)  NOT NULL,   -- °C, sensor do MLX90614
  sons           SMALLINT UNSIGNED NOT NULL DEFAULT 0,  -- vocalizações no período
  ventilador     BOOLEAN       NOT NULL DEFAULT FALSE,  -- relé ligado?
  criado_em      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_leituras_bovino FOREIGN KEY (bovino_id)
    REFERENCES bovinos (id) ON DELETE CASCADE,
  KEY idx_leituras_bovino_data (bovino_id, criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- ---------------------------------------------------------------------
-- Listas fixas
-- ---------------------------------------------------------------------
INSERT IGNORE INTO racas (id, nome, limite_ambiente) VALUES
  (1, 'Nelore',    35.0),
  (2, 'Guzerá',    35.0),
  (3, 'Gir',       35.0),
  (4, 'Senepol',   35.0),   -- taurina, mas adaptada ao calor
  (5, 'Angus',     27.0),
  (6, 'Holandesa', 27.0);

INSERT IGNORE INTO vacinas (id, usuario_id, nome) VALUES
  (1, NULL, 'Brucelose (B19/RB51)'),
  (2, NULL, 'Clostridioses'),
  (3, NULL, 'Febre Aftosa'),
  (4, NULL, 'Raiva dos Herbívoros');
