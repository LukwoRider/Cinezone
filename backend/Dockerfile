# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining application code
COPY . .

# Expose port (Backend typically uses 3000 as per express config)
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
