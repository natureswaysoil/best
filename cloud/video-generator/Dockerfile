FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY config ./config
COPY scripts ./scripts
COPY public ./public
COPY content ./content

ENV NODE_ENV=production
ENV FFMPEG_TIMEOUT_MS=900000
ENV GOOGLE_CLOUD_VIDEO_JOB=true

CMD ["npm", "run", "videos"]
