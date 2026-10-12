# BovTrack no Docker

Sobe o banco MySQL (já com as tabelas do `backend/banco.sql`), o phpMyAdmin
e o site, sem instalar XAMPP.

## 1. Instalar o Docker (uma vez só)

Baixe e instale o **Docker Desktop**: https://www.docker.com/products/docker-desktop/
Depois de instalar, abra o Docker Desktop e deixe ele aberto.

## 2. Configurar os parâmetros

Na pasta do projeto, copie o arquivo `.env.example` e renomeie a cópia para `.env`.
Abra o `.env` e troque o que quiser:

| Parâmetro | Para que serve | Padrão |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | senha do usuário `root` do banco | `troque-esta-senha` |
| `MYSQL_USER` / `MYSQL_PASSWORD` | usuário que o site e o servidor usam | `bovtrack` / `bovtrack123` |
| `DB_PORT` | porta do MySQL no seu computador | `3306` |
| `PMA_PORT` | porta do phpMyAdmin | `8080` |
| `SITE_PORT` | porta do site | `8000` |
| `TZ` | fuso horário | `America/Sao_Paulo` |

Se o XAMPP estiver ligado, ele já usa a porta 3306: desligue o MySQL do XAMPP
ou mude `DB_PORT` para `3307`.

## 3. Subir

Abra o terminal na pasta do projeto e rode:

```
docker compose up -d
```

Na primeira vez demora um pouco (baixa as imagens). Depois abra:

- **Site:** http://localhost:8000
- **phpMyAdmin:** http://localhost:8080
  (usuário `bovtrack`, senha `bovtrack123`, ou `root` com a senha do `.env`)

## Comandos do dia a dia

| O que fazer | Comando |
|---|---|
| Ligar | `docker compose up -d` |
| Desligar (os dados ficam salvos) | `docker compose down` |
| Ver se está tudo rodando | `docker compose ps` |
| Ver os erros do banco | `docker compose logs db` |
| **Zerar o banco** e recriar do `banco.sql` | `docker compose down -v` e depois `docker compose up -d` |

O `banco.sql` só roda quando o banco é criado pela primeira vez. Se você mudar
o `banco.sql`, use o "zerar o banco" para aplicar (isso apaga os dados atuais).
