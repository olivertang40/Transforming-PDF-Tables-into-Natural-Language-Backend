FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --silent --no-audit --no-fund || true

# Copy source
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
