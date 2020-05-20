FROM node:13.12.0-alpine as build
RUN mkdir -p /usr/src/app 
WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY . /usr/src/app
RUN npm install
RUN npm run build
CMD npm run start



