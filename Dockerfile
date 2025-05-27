# Use Node.js LTS
FROM node:22

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Dockerfile
COPY firebase-service-account.json ./firebase-service-account.json

# Copy source code
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
