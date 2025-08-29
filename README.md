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

### Automated GitHub Pages Deployment

The site is automatically deployed to GitHub Pages using GitHub Actions:

1. **Push to main branch**: Any push to the `main` branch triggers the deployment workflow
2. **Automatic build**: The workflow installs Hugo, builds the site with `--minify`, and deploys to GitHub Pages
3. **GitHub Pages setup**: Ensure GitHub Pages is enabled in repository settings with source set to "GitHub Actions"

The deployment workflow (`.github/workflows/deploy.yml`):
- Installs Hugo Extended v0.146.4
- Initializes git submodules for the theme
- Builds the site with production optimizations
- Deploys to GitHub Pages using the official action

### Manual Deployment

For manual deployment to other hosting providers:

1. Build the site: `hugo --minify`
2. Upload the contents of `public/` to your web server

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
