FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install global dependencies
RUN npm install -g sequelize-cli

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "start"] 