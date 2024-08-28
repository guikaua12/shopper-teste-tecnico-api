FROM node:20-alpine

WORKDIR /app

RUN apk update \
    && apk add curl \
    && apk add bash

COPY package*.json ./

RUN npm cache clean --force
RUN npm install --legacy-peer-deps

COPY . .

COPY ./wait-for-it.sh /app/wait-for-it.sh

EXPOSE 3000

RUN chmod +x /app/wait-for-it.sh

ENTRYPOINT [ "/bin/bash", "-c" ]
CMD ["./wait-for-it.sh db:5432 -t 40 -- npm run start:migrate"]
