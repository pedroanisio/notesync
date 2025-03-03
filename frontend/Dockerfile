FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Run this inside the container
RUN mkdir -p /app/node_modules/.cache
RUN chmod -R 777 /app/node_modules/.cache

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]

