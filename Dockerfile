# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm clean-install

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm clean-install --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

RUN mkdir -p /uploads/temp && chown -R node:node /uploads

USER node

EXPOSE 8080

CMD ["node", "dist/main"]