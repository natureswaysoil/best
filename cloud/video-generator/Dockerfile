FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg curl ca-certificates gnupg \
  && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list \
  && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg \
  && apt-get update \
  && apt-get install -y --no-install-recommends google-cloud-cli \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY config ./config
COPY data ./data
COPY scripts ./scripts
COPY public ./public
COPY content ./content

ENV NODE_ENV=production
ENV FFMPEG_TIMEOUT_MS=900000
ENV JOB_STEP_TIMEOUT_MS=1800000
ENV GOOGLE_CLOUD_VIDEO_JOB=true

CMD ["npm", "run", "video:social"]
