# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the port
EXPOSE 5510

# Command to run the app
CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
