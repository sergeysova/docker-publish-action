FROM node:12
LABEL "repository"="https://github.com/sergeysova/docker-publish-action"
LABEL "maintainer"="Sergey Sova"

COPY package.json package-lock.json .
RUN npm i --production
COPY ./src ./src

ENTRYPOINT "node src/main.js"
