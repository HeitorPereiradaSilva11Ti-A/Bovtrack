# Imagem do banco do BovTrack: MySQL já com o backend/banco.sql dentro.
# Na primeira vez que o container sobe, as tabelas e os dados de exemplo são criados.
FROM mysql:8.4

ENV MYSQL_DATABASE=bovtrack \
    TZ=America/Sao_Paulo

COPY backend/banco.sql /docker-entrypoint-initdb.d/01-banco.sql

CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
