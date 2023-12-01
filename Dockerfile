FROM node:21
WORKDIR /var/www/octostream
COPY ./package.json ./
COPY ./.yarn/plugins ./.yarn/plugins/
COPY ./.yarn/releases ./.yarn/releases/
COPY ./.yarnrc.yml ./
RUN yarn install
COPY . .
EXPOSE 3000
CMD [ "node", "." ]