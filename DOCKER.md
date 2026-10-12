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

O `banco.sql` e o site ficam **dentro das imagens**. Se você mudar o
`banco.sql` ou alguma página, rode `docker compose up -d --build` para montar
as imagens de novo. Para o banco usar o `banco.sql` novo, também é preciso
zerar o banco (isso apaga os dados atuais).

## Publicar as imagens no Docker Hub

Assim qualquer pessoa do grupo roda o BovTrack sem precisar do código.

**Quem publica (uma pessoa só):**

1. Crie uma conta grátis em https://hub.docker.com
2. No `.env`, coloque seu usuário: `DOCKER_USUARIO=seu-usuario`
3. No terminal, na pasta do projeto:

```
docker login
docker compose build
docker compose push
```

Pronto: as imagens `seu-usuario/bovtrack-db` e `seu-usuario/bovtrack-site`
ficam no Docker Hub. Para publicar uma versão nova, rode `build` e `push` de novo.
Se quiser guardar versões, troque `VERSAO=latest` por `VERSAO=1.0`, `1.1`...

**Quem só vai usar:**

Precisa só de dois arquivos: o `docker-compose.yml` e um `.env` com o mesmo
`DOCKER_USUARIO` de quem publicou. Na pasta deles:

```
docker compose pull
docker compose up -d
```
