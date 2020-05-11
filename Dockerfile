FROM node:14

ENV PORT=8080

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE $PORT

CMD [ "yarn", "start"]
