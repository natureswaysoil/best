FROM node:20-alpine
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
