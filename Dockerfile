FROM node:10

WORKDIR /etsy-server

COPY package*.json ./

RUN npm install

COPY .. .

EXPOSE 3000

CMD [ "npm", "start" ]