FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY package.json yarn.lock ./

FROM base AS development
COPY . .
EXPOSE 3000
CMD ["node", "--watch", "src/server.js"]

FROM base AS production
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production --non-interactive
COPY src ./src
COPY knexfile.js ./
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
