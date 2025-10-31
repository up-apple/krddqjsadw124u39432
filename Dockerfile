# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy the rest of the backend application code
COPY backend/ .

# Switch to a non-root user for security
USER node

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the application
CMD [ "node", "server.js" ]
