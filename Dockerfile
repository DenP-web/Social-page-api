# We use the Alpine Linux version node 14
FROM node:19.5.0-alpine

# Indicate our working directory
WORKDIR /app

#Copy package.json and package-lock.json in container

COPY package*.json ./

#Installing dependencies
RUN npm install

#Copy the rest of the application to the container
COPY . .

#Installing Prisma
RUN npm install -g prisma

# Generate Prisma client
RUN prisma generate

# Copy Prisma Schema 
COPY prisma/schema.prisma ./prisma/

# Open port in our container 
EXPOSE 3000

# Start server 
CMD ["npm", "start"]


