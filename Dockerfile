FROM node:22.23-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm clean-install

COPY . .
RUN npm run build

FROM node:22.23-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm clean-install --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node --chmod=755 /usr/src/app/src/core/mail/pages ./dist/core/mail/pages

RUN mkdir -p /usr/src/app/logs && chown -R node:node /usr/src/app/logs
RUN mkdir -p /usr/src/app/uploads && chown -R node:node /usr/src/app/uploads
RUN mkdir -p /usr/src/app/uploads/temp && chown -R node:node /usr/src/app/uploads/temp

USER node

EXPOSE 4400

CMD ["node", "dist/main"]