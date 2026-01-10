FROM node:18-alpine
WORKDIR /app

# copy package files first
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the code
COPY . .

EXPOSE 5504

CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
