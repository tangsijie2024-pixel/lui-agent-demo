FROM node:18-alpine

WORKDIR /app

# Install root deps
COPY package*.json ./
RUN npm ci

# Install client deps
COPY client/package*.json ./client/
RUN npm ci --prefix client

# Copy all source
COPY . .

# Build frontend + backend
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]
