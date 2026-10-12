# Imagem do site do BovTrack (HTML/CSS/JS servidos pelo nginx).
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
