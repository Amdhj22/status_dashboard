FROM node:latest

RUN apt-get update && \
    apt-get install -y nginx

ADD default /etc/nginx/sites-available

RUN mkdir -p /app

WORKDIR /app

ADD . /app

RUN npm install && \
    chmod 744 start.sh

EXPOSE 80

CMD ./start.sh