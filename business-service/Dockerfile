# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including redis
RUN npm install

# Copy rest of the app
COPY . .

# Expose port from .env or default 5501
EXPOSE ${PORT:-5501}

# Start app with nodemon
CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
