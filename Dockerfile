# ===== Build stage =====
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Vite app
RUN npm run build

# ===== Production stage =====
FROM nginx:stable-alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
