FROM node:20

WORKDIR /usr/src/app

COPY package.json package-lock.json server.js ./
RUN npm install --ignore-scripts

RUN mkdir /home/bibtexnode \
    && groupadd --system bibtexnode \
    && useradd bibtexnode --gid bibtexnode \
    && chown -R bibtexnode:bibtexnode /home/bibtexnode

USER bibtexnode

EXPOSE 3000

CMD ["npm", "start"]
