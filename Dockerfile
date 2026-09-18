FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm install -g ts-node typescript

# Copy workflow files
COPY workflows/ ./workflows/

# Set environment
ENV NODE_ENV=production

# Run the workflow
CMD ["npm", "run", "workflow:blog-video"]
