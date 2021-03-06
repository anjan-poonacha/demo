FROM node:slim
USER root
WORKDIR '/app'
RUN npm i typescript pm2 -g
COPY ./package.json ./
RUN npm install
COPY . .
CMD ["pm2-runtime","npm", "--", "start"]`
