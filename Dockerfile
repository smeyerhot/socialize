# FROM node:13.12.0-alpine as build
# WORKDIR /app
# ENV PATH /app/node_modules/.bin:$PATH
# COPY package.json ./
# RUN npm install
# COPY . ./
# EXPOSE 3000
# RUN npm run build
# CMD npm run start



FROM node:13.12.0 

WORKDIR /usr/src/app/
ENV TZ America/New_York
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json . /usr/src/app/
RUN npm install
COPY . ./
EXPOSE 3000
RUN npm run build
CMD npm run start

