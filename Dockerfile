##################################
# BASE
##################################
FROM node:18.20.2-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
EXPOSE 3000/tcp

##################################
# DEPENDENCIES
##################################
FROM base AS devdeps
ENV NODE_ENV development
RUN npm i --force
COPY . ./

##################################
# DEV ENVIRONMENT
##################################
FROM devdeps AS dev
RUN npx prisma generate
