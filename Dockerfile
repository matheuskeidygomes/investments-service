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

##################################
# BUILD
##################################
FROM devdeps AS build
RUN npm run build

##################################
# PROD DEPENDENCIES
##################################
FROM base AS deps
ENV NODE_ENV production
RUN npm ci --force \
    && npm cache clean --force \
    && npm prune --dry-run
COPY . ./
RUN npx prisma generate

##################################
# PROD ENVIRONMENT
##################################
FROM base AS prod
ENV NODE_ENV production
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
USER node
CMD [ "node", "dist/main.js" ]

