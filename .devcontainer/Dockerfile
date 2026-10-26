FROM node:24

RUN apt update && apt install -y less man-db
RUN apt upgrade -y

ENV DEVCONTAINER=true

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm config set strict-ssl false && npm install
