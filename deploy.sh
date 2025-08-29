#!/bin/bash

# Deploy script for Hugo website
# Usage: ./deploy.sh [production|staging] [deploy-method]

set -e

# Configuration
HUGO_ENV="${1:-production}"
DEPLOY_METHOD="${2:-rsync}"
BUILD_DIR="public"
STAGING_URL="staging.alvroble.com"
PRODUCTION_URL="alvroble.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v hugo &> /dev/null; then
        error "Hugo is not installed. Please install Hugo Extended version."
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git is not installed."
    fi
    
    log "Dependencies check passed"
}

# Update submodules
update_submodules() {
    log "Updating git submodules..."
    git submodule update --init --recursive
}

# Build the site
build_site() {
    log "Building Hugo site for ${HUGO_ENV} environment..."
    
    # Clean previous build
    rm -rf ${BUILD_DIR}
    
    # Set environment variables
    export HUGO_ENVIRONMENT="${HUGO_ENV}"
    export HUGO_ENV="${HUGO_ENV}"
    
    # Build site with minification
    hugo --minify
    
    log "Site built successfully in ${BUILD_DIR}/"
}

# Deploy to GitHub Pages (manual method)
deploy_github_pages() {
    log "Deploying to GitHub Pages..."
    
    # Check if gh-pages branch exists
    if ! git show-ref --verify --quiet refs/heads/gh-pages; then
        log "Creating gh-pages branch..."
        git checkout --orphan gh-pages
        git rm -rf .
        git commit --allow-empty -m "Initial gh-pages commit"
        git checkout main
    fi
    
    # Deploy to gh-pages branch
    git worktree add /tmp/gh-pages gh-pages
    rm -rf /tmp/gh-pages/*
    cp -R ${BUILD_DIR}/* /tmp/gh-pages/
    cd /tmp/gh-pages
    git add --all
    git commit -m "Deploy site - $(date)"
    git push origin gh-pages
    cd -
    git worktree remove /tmp/gh-pages
    
    log "Deployed to GitHub Pages"
}

# Deploy via rsync (for VPS/server)
deploy_rsync() {
    local target_url="$1"
    
    if [ -z "${DEPLOY_USER}" ] || [ -z "${DEPLOY_HOST}" ] || [ -z "${DEPLOY_PATH}" ]; then
        error "For rsync deployment, set environment variables: DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH"
    fi
    
    log "Deploying to ${target_url} via rsync..."
    
    rsync -avz --delete \
        --exclude '.git*' \
        --exclude 'node_modules' \
        --exclude '.DS_Store' \
        ${BUILD_DIR}/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}
    
    log "Deployed to ${target_url}"
}

# Deploy to S3 (optional)
deploy_s3() {
    if [ -z "${S3_BUCKET}" ]; then
        error "For S3 deployment, set S3_BUCKET environment variable"
    fi
    
    log "Deploying to S3 bucket: ${S3_BUCKET}..."
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed."
    fi
    
    aws s3 sync ${BUILD_DIR}/ s3://${S3_BUCKET} --delete
    
    log "Deployed to S3"
}

# Main deployment function
deploy() {
    case "${DEPLOY_METHOD}" in
        "github-pages")
            deploy_github_pages
            ;;
        "rsync")
            if [ "${HUGO_ENV}" = "production" ]; then
                deploy_rsync "${PRODUCTION_URL}"
            else
                deploy_rsync "${STAGING_URL}"
            fi
            ;;
        "s3")
            deploy_s3
            ;;
        "local")
            log "Local deployment - files available in ${BUILD_DIR}/"
            ;;
        *)
            error "Unknown deployment method: ${DEPLOY_METHOD}. Use: github-pages, rsync, s3, or local"
            ;;
    esac
}

# Show usage
show_usage() {
    echo "Usage: $0 [production|staging] [github-pages|rsync|s3|local]"
    echo ""
    echo "Environment variables for rsync deployment:"
    echo "  DEPLOY_USER - SSH username"
    echo "  DEPLOY_HOST - Server hostname"
    echo "  DEPLOY_PATH - Target directory path"
    echo ""
    echo "Environment variables for S3 deployment:"
    echo "  S3_BUCKET - S3 bucket name"
    echo ""
    echo "Examples:"
    echo "  $0 production github-pages"
    echo "  $0 staging rsync"
    echo "  $0 production s3"
    echo "  $0 production local"
}

# Main script
main() {
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_usage
        exit 0
    fi
    
    log "Starting deployment process..."
    log "Environment: ${HUGO_ENV}"
    log "Deploy method: ${DEPLOY_METHOD}"
    
    check_dependencies
    update_submodules
    build_site
    deploy
    
    log "Deployment completed successfully!"
}

# Run main function
main "$@"