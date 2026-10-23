# Node 24 ships the built-in SQLite module (node:sqlite)
FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
RUN mkdir -p data && chown node:node data
USER node
EXPOSE 3000
CMD ["npm", "start", "--", "-p", "3000"]
