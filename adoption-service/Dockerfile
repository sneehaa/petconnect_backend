# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies including redis
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app uses
# Use environment variable PORT or default 5000
EXPOSE ${PORT:-5000}

# Start the app using nodemon (with legacy-watch for Docker)
CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
