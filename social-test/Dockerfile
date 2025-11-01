FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
ENV PORT=8080
EXPOSE 8080

# Start the service
CMD ["node", "server.js"]
