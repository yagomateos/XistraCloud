# Use Node.js 20 Alpine
FROM node:20-alpine

# Add build argument for cache busting
ARG BUILD_ID
ENV BUILD_ID=${BUILD_ID}

WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code from backend
COPY backend/ ./

# Create build info file
RUN echo "Build ID: ${BUILD_ID}" > /app/build-info.txt
RUN echo "Build Time: $(date)" >> /app/build-info.txt

# Expose port (Railway will override this)
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
