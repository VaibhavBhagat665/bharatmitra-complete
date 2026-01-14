FROM node:18-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of KChromium work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Determine path of installed google chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Copy root package.json (if needed for shared types, though mostly for frontend)
COPY package*.json ./

# Copy server package.json specifically
COPY server/package.json server/package-lock.js* ./server/

# Install root deps (optional, but good for safety)
RUN npm install

# Install server deps
WORKDIR /usr/src/app/server
RUN npm install

# Go back to root
WORKDIR /usr/src/app

COPY . .

EXPOSE 8080
# Run from the root, targeting the server script
CMD [ "node", "server/server.js" ]
