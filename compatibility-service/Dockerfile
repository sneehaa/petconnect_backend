FROM node:18-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies including redis
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 5506

CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
