# Build stage
FROM hugomods/hugo:exts as builder

# Set working directory
WORKDIR /src

# Copy source files
COPY . .

# Initialize submodules and build
RUN git submodule update --init --recursive
RUN hugo --minify

# Production stage
FROM nginx:alpine

# Copy built site to nginx
COPY --from=builder /src/public /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]