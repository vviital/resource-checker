FROM node:10.13.0-alpine

WORKDIR /home/resource-checker

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge \
      yarn

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN npm i -g clinic

COPY . .

RUN npx lerna bootstrap

# RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
#     && mkdir -p /home/pptruser/Downloads \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /home/resource-checker

# USER pptruser

RUN yarn build
