FROM node:22-alpine

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY apps/web/package.json ./apps/web/

RUN npm install -g pnpm@10.30.1

COPY . .

RUN pnpm install --frozen-lockfile && \
    pnpm install --recursive

EXPOSE 5173

CMD ["pnpm", "--filter", "@freelancer/web", "dev"]
