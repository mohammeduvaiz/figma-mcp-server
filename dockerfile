FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the built app
COPY build/ ./build/

# Set environment variables (placeholder values to be overridden at runtime)
ENV FIGMA_API_TOKEN=""
ENV TRANSPORT_TYPE="sse"
ENV PORT=3000
ENV API_KEY=""

# Expose the port
EXPOSE 3000

# Run the server
CMD ["node", "build/index.js"]