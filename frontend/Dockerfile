FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --silent --no-audit --no-fund || true

# Copy source
COPY . .

# Expose dev port
EXPOSE 3000

# Default command for local dev; volumes in compose will override sources when needed
CMD ["npm", "run", "dev"]
