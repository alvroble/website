# Personal Website

My personal website vibed with Hugo and the Zen theme, featuring blog posts and GitHub contributions tracking.

## Features

- **Blog Posts**: Share thoughts on development, Bitcoin, and other topics
- **GitHub Contributions**: Track open source contributions and pull requests
- **Clean Design**: Minimal, fast-loading design using the Zen theme
- **GitHub Pages Ready**: Configured for easy deployment

## Tech Stack

- **Hugo**: Static site generator
- **Zen Theme**: Clean, minimal Hugo theme
- **GitHub Pages**: Hosting platform
- **GitHub API**: For contributions tracking (planned)

## Local Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) (v0.146.4+ recommended)
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/alvroble/website.git
   cd website
   ```

2. Initialize and update submodules:
   ```bash
   git submodule update --init --recursive
   ```

3. Start the development server:
   ```bash
   hugo server --buildDrafts --liveReload
   ```

4. Open your browser to `http://localhost:1313`

### Building

To build the site for production:
```bash
hugo --minify
```

The built site will be in the `public/` directory.

## Project Structure

```
.
├── content/           # Content files (blog posts, pages)
│   ├── blog/         # Blog posts
│   ├── contributions/ # GitHub contributions section
│   └── about.md      # About page
├── layouts/          # Custom layouts
│   └── contributions/ # Custom contributions layout
├── themes/           # Hugo themes (Zen theme as submodule)
├── static/           # Static assets
├── hugo.toml         # Hugo configuration
└── README.md         # This file
```

## Content Management

### Adding Blog Posts

Create new blog posts in the `content/blog/` directory:

```bash
hugo new blog/my-new-post.md
```

### Blog Post Front Matter

```yaml
---
title: "Post Title"
date: 2025-01-14
draft: false
categories: ["Category1", "Category2"]
tags: ["tag1", "tag2"]
description: "Post description"
---
```

### Adding Pages

Create new pages in the `content/` directory:

```bash
hugo new my-page.md
```

## GitHub Contributions Tracking

The contributions page is designed to display:
- Pull request statistics (open, merged, closed)
- Recent GitHub activity
- Projects being contributed to

*Note: GitHub API integration is planned for future updates*

## Deployment

This website supports multiple deployment methods. Choose the one that best fits your needs:

### 1. GitHub Pages (Recommended - Automated)

**GitHub Actions (Automated)**
The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

1. Go to your repository settings on GitHub
2. Navigate to "Pages" section
3. Under "Source", select "GitHub Actions"
4. Push your changes to the `main` branch
5. The workflow will automatically build and deploy your site

The site will be available at `https://yourusername.github.io/repository-name`

**Manual GitHub Pages**
If you prefer manual deployment:
```bash
./deploy.sh production github-pages
```

### 2. Netlify (One-click deployment)

1. Fork this repository
2. Connect your GitHub account to Netlify
3. Create a new site from Git and select your fork
4. Netlify will automatically detect the `netlify.toml` configuration
5. Your site will be deployed automatically on every push

Alternatively, drag and drop the `public/` folder to Netlify after running:
```bash
hugo --minify
```

### 3. Docker Deployment

**Local development with Docker:**
```bash
# Start development server
docker-compose --profile dev up

# Build and serve production site
docker-compose --profile prod up --build
```

**Production deployment:**
```bash
# Build Docker image
docker build -t alvroble-website .

# Run container
docker run -d -p 80:80 --name alvroble-website alvroble-website
```

### 4. VPS/Server Deployment

**Using the deployment script:**
```bash
# Set environment variables
export DEPLOY_USER="your-username"
export DEPLOY_HOST="your-server.com"
export DEPLOY_PATH="/var/www/html"

# Deploy to production
./deploy.sh production rsync
```

**Manual deployment:**
```bash
# Build the site
hugo --minify

# Upload to your server
rsync -avz --delete public/ user@server:/var/www/html/
```

### 5. AWS S3 Deployment

```bash
# Set S3 bucket name
export S3_BUCKET="your-bucket-name"

# Deploy using the script
./deploy.sh production s3

# Or manually with AWS CLI
hugo --minify
aws s3 sync public/ s3://your-bucket-name --delete
```

### 6. Local Preview

To build and preview locally:
```bash
# Development server with live reload
hugo server --buildDrafts --liveReload

# Or with Docker
docker-compose --profile dev up

# Build for production
hugo --minify
```

### Deployment Script Usage

The included `deploy.sh` script supports multiple deployment methods:

```bash
# GitHub Pages
./deploy.sh production github-pages

# VPS via rsync
./deploy.sh production rsync

# AWS S3
./deploy.sh production s3

# Local build only
./deploy.sh production local

# Staging environment
./deploy.sh staging rsync
```

### Environment Variables

For automated deployments, set these environment variables:

**VPS/Server (rsync):**
- `DEPLOY_USER`: SSH username
- `DEPLOY_HOST`: Server hostname  
- `DEPLOY_PATH`: Target directory path

**AWS S3:**
- `S3_BUCKET`: S3 bucket name
- AWS credentials (via AWS CLI or IAM roles)

## Customization

### Theme Customization

The Zen theme can be customized by:
- Overriding theme files in your `layouts/` directory
- Adding custom CSS in `assets/` or `static/`
- Modifying theme parameters in `hugo.toml`

### Adding New Sections

1. Create content directory: `content/new-section/`
2. Add `_index.md` for the section page
3. Update navigation in `hugo.toml`

## Contributing

This is a personal website, but suggestions and improvements are welcome!

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Hugo](https://gohugo.io/) - Static site generator
- [Zen Theme](https://github.com/frjo/hugo-theme-zen) - Clean, minimal theme
- [GitHub Pages](https://pages.github.com/) - Hosting platform
