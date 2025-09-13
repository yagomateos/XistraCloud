# Use Node.js 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port (Railway will override this)
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
