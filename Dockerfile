FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm clean-install

COPY . ./

RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "start:prod" ]