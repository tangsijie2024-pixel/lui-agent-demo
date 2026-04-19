FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx tsc && cp -r src/data dist/data

EXPOSE 4000
CMD ["npm", "start"]
