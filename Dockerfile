FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npx", "serverless", "offline", "start", "--host", "0.0.0.0", "--httpPort", "3001"]
