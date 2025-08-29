# Hugo Website Deployment Guide

This guide provides comprehensive instructions for deploying your Hugo website using various methods.

## Quick Start

### GitHub Pages (Recommended for most users)

1. **Automatic deployment (GitHub Actions):**
   - Push your code to GitHub
   - Go to repository Settings → Pages
   - Under "Source", select "GitHub Actions"
   - The included workflow will automatically deploy on every push to `main`

2. **Manual deployment:**
   ```bash
   ./deploy.sh production github-pages
   ```

### Netlify (Easiest for beginners)

1. Connect your GitHub repository to Netlify
2. Netlify automatically detects Hugo and uses the included `netlify.toml`
3. Your site deploys automatically on every git push

## Detailed Deployment Methods

### 1. GitHub Pages

#### Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Installs Hugo Extended
- Builds the site with minification
- Deploys to GitHub Pages
- Runs on every push to `main` branch

**Setup:**
1. Go to repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Push to `main` branch to trigger deployment

#### Manual GitHub Pages Deployment

```bash
# Using the deployment script
./deploy.sh production github-pages

# Or manually
git checkout --orphan gh-pages
hugo --minify
# Copy public/* to gh-pages branch and push
```

### 2. Netlify

#### Automatic Deployment

1. Sign up at [netlify.com](https://netlify.com)
2. Connect your GitHub account
3. Create new site from Git
4. Select your repository
5. Netlify automatically detects Hugo settings from `netlify.toml`

#### Manual Deployment

```bash
# Build the site
hugo --minify

# Drag and drop the public/ folder to Netlify's deploy interface
```

#### Netlify Configuration

The included `netlify.toml` configures:
- Build command: `hugo --minify`
- Publish directory: `public`
- Environment variables
- Security headers
- Cache headers for performance

### 3. Docker Deployment

#### Development

```bash
# Start development server
docker-compose --profile dev up

# Access at http://localhost:1313
```

#### Production

```bash
# Build and run production container
docker-compose --profile prod up --build

# Or manually
docker build -t alvroble-website .
docker run -d -p 80:80 --name website alvroble-website
```

The Docker setup includes:
- Multi-stage build for optimization
- Nginx web server
- Security headers
- Gzip compression
- Health checks

### 4. VPS/Server Deployment

#### Using the deployment script

```bash
# Set environment variables
export DEPLOY_USER="your-username"
export DEPLOY_HOST="your-server.com"
export DEPLOY_PATH="/var/www/html"

# Deploy to production
./deploy.sh production rsync

# Deploy to staging
./deploy.sh staging rsync
```

#### Manual VPS deployment

```bash
# Build the site
hugo --minify

# Upload via rsync
rsync -avz --delete public/ user@server:/var/www/html/

# Or via SCP
scp -r public/* user@server:/var/www/html/
```

#### Server Requirements

- Web server (Nginx, Apache, etc.)
- HTTPS certificate (Let's Encrypt recommended)
- Basic firewall configuration

**Example Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static file caching
    location ~* \.(css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. AWS S3 Static Website

#### Using the deployment script

```bash
# Set S3 bucket name
export S3_BUCKET="your-bucket-name"

# Deploy
./deploy.sh production s3
```

#### Manual S3 deployment

```bash
# Build the site
hugo --minify

# Sync to S3
aws s3 sync public/ s3://your-bucket-name --delete

# Enable static website hosting
aws s3 website s3://your-bucket-name --index-document index.html --error-document 404.html
```

#### S3 Setup Requirements

1. Create S3 bucket
2. Enable static website hosting
3. Configure bucket policy for public read access
4. Optional: Set up CloudFront CDN

### 6. Other Platforms

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### GitLab Pages

Add `.gitlab-ci.yml`:
```yaml
pages:
  image: registry.gitlab.com/pages/hugo/hugo_extended:latest
  script:
    - hugo --minify
  artifacts:
    paths:
      - public
  only:
    - main
```

## Deployment Script Reference

The included `deploy.sh` script supports multiple methods:

### Usage

```bash
./deploy.sh [environment] [method]
```

### Parameters

- **Environment:** `production` or `staging`
- **Method:** `github-pages`, `rsync`, `s3`, or `local`

### Examples

```bash
# Local build only
./deploy.sh production local

# GitHub Pages
./deploy.sh production github-pages

# VPS deployment
./deploy.sh production rsync

# AWS S3
./deploy.sh production s3

# Staging environment
./deploy.sh staging rsync
```

### Environment Variables

| Method | Variables | Description |
|--------|-----------|-------------|
| rsync | `DEPLOY_USER`, `DEPLOY_HOST`, `DEPLOY_PATH` | SSH credentials and target path |
| s3 | `S3_BUCKET` | S3 bucket name |
| github-pages | None | Uses git configuration |

## Performance Optimization

### Build Optimization

The site is configured for optimal performance:

- **Minification:** Hugo minifies HTML, CSS, and JS
- **Image optimization:** Hugo processes images efficiently
- **Cache headers:** Long-term caching for static assets
- **Compression:** Gzip enabled for text content

### Content Optimization

- Use WebP images when possible
- Optimize image sizes for different screen resolutions
- Minimize custom CSS and JavaScript
- Use Hugo's built-in asset processing

## Troubleshooting

### Common Issues

1. **Submodule errors:**
   ```bash
   git submodule update --init --recursive
   ```

2. **Build failures:**
   - Check Hugo version (requires 0.146.4+)
   - Verify theme installation
   - Check for syntax errors in content files

3. **Deployment failures:**
   - Verify environment variables
   - Check SSH key configuration for rsync
   - Ensure proper permissions for S3 bucket

### Debug Mode

```bash
# Enable verbose Hugo output
hugo --verbose --minify

# Debug deployment script
bash -x ./deploy.sh production local
```

## Security Considerations

- Use HTTPS in production
- Configure security headers
- Regularly update dependencies
- Use environment variables for sensitive data
- Implement proper access controls

## Monitoring and Maintenance

- Set up uptime monitoring
- Configure log rotation
- Monitor performance metrics
- Keep Hugo and dependencies updated
- Regular security audits

## Support

For deployment issues:
1. Check the [Hugo documentation](https://gohugo.io/hosting-and-deployment/)
2. Review platform-specific guides
3. Check repository issues and discussions