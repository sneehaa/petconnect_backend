# Use Node.js 18
FROM node:18-alpine

WORKDIR /app

# Copy package.json first (better caching)
COPY package*.json ./

# Install dependencies (express, redis, mongoose, etc.)
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port (from .env or default 5502)
EXPOSE ${PORT:-5502}

# Start the app
CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
