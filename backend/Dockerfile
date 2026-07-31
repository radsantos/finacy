FROM node:20

WORKDIR /app

RUN corepack enable

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

COPY backend ./backend

RUN pnpm install --frozen-lockfile

WORKDIR /app/backend

RUN pnpm prisma generate

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm dev"]