FROM node:17.8.0-buster

COPY . /attearnings
WORKDIR /attearnings

RUN npm install && npm run build