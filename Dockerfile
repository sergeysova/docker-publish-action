FROM node:12
LABEL "repository"="https://github.com/sergeysova/docker-publish-action"
LABEL "maintainer"="Sergey Sova"

ADD package.json package-lock.json /action/
ADD entrypoint.sh /action/entrypoint.sh
RUN npm i --production
ADD ./src /action/src

ENTRYPOINT ["/action/entrypoint.sh"]
