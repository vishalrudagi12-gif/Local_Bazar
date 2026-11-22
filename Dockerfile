FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
