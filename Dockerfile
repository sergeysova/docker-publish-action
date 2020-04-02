FROM node:12
LABEL "repository"="https://github.com/sergeysova/docker-publish-action"
LABEL "maintainer"="Sergey Sova"

ADD package.json package-lock.json /
ADD entrypoint.sh /entrypoint.sh
RUN npm i --production
ADD ./src /src

ENTRYPOINT ["/entrypoint.sh"]
