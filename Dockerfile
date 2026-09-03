FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY forwarder.js ./
COPY generate-session.js ./

# API_ID, API_HASH, SESSION_STRING, SOURCE_CHANNEL, DEST_CHANNEL,
# KEEP_FORWARD_TAG are supplied as env vars in bunny.net, not baked in.

CMD ["node", "forwarder.js"]
