FROM node:10.13.0-alpine

WORKDIR /home/resource-checker

RUN apk add yarn

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

RUN yarn bootstrap
RUN yarn build
