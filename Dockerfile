FROM node:9.11.1-alpine
WORKDIR /build
ADD . /build/
RUN npm i && npm run build

EXPOSE 8080
CMD npm start
