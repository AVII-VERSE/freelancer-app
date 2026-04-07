FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./prisma/

RUN npm install -g pnpm@10.30.1

COPY . .

RUN pnpm install --frozen-lockfile && \
    pnpm install --recursive && \
    cd apps/api && pnpm prisma generate

EXPOSE 5000

CMD ["pnpm", "--filter", "@freelancer/api", "dev"]
