# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port that the service will run on
EXPOSE 3005

# Command to run the service
CMD ["node", "confirmation-service.js"]
