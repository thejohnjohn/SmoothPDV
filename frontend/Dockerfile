FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY package.json yarn.lock ./

FROM base AS development
COPY . .
EXPOSE 5173
CMD ["yarn", "dev"]

FROM base AS build
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY . .
# O script "build" do projeto roda "tsc -b" e falha por erros de tipo pré-existentes; o bundle é gerado direto pelo Vite.
RUN yarn install --frozen-lockfile --non-interactive && yarn vite build

FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
