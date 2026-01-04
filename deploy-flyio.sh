#!/bin/bash

# ===================================
# Fly.io Deployment Script for UNO Online Backend
# ===================================

set -e

echo "🚀 Starting Fly.io deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ flyctl is not installed${NC}"
    echo "Install it: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Fly.io${NC}"
    echo "Run: flyctl auth login"
    exit 1
fi

# Step 1: Create app (if not exists)
echo -e "${GREEN}📦 Creating Fly.io app...${NC}"
flyctl apps list | grep -q "uno-online-backend" || flyctl apps create uno-online-backend

# Step 2: Create PostgreSQL database
echo -e "${GREEN}🗄️  Setting up PostgreSQL...${NC}"
flyctl postgres list | grep -q "uno-postgres" || {
    flyctl postgres create --name uno-postgres --region lax --vm-size shared-cpu-1x --volume-size 1
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 10
}

# Step 3: Attach database to app
echo -e "${GREEN}🔗 Attaching database...${NC}"
flyctl postgres attach uno-postgres --app uno-online-backend || echo "Database already attached"

# Step 4: Create Redis instance
echo -e "${GREEN}📮 Setting up Redis...${NC}"
flyctl redis list | grep -q "uno-redis" || {
    flyctl redis create --name uno-redis --region lax --plan free
    echo -e "${YELLOW}⏳ Waiting for Redis to be ready...${NC}"
    sleep 10
}

# Step 5: Set secrets
echo -e "${GREEN}🔐 Setting secrets...${NC}"
echo "Enter JWT_SECRET (min 32 chars) or press Enter to auto-generate:"
read JWT_INPUT
if [ -z "$JWT_INPUT" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Auto-generated JWT_SECRET"
else
    JWT_SECRET=$JWT_INPUT
fi

flyctl secrets set JWT_SECRET="$JWT_SECRET" --app uno-online-backend

echo "Enter CLIENT_URL (your GitHub Pages URL):"
read CLIENT_URL
flyctl secrets set CLIENT_URL="$CLIENT_URL" --app uno-online-backend

# Get Redis URL
REDIS_URL=$(flyctl redis status uno-redis -j | jq -r '.PrivateUrl')
flyctl secrets set REDIS_URL="$REDIS_URL" --app uno-online-backend

# Step 6: Deploy
echo -e "${GREEN}🚢 Deploying to Fly.io...${NC}"
flyctl deploy --config fly.toml

# Step 7: Run database migrations
echo -e "${GREEN}🔄 Running database migrations...${NC}"
flyctl ssh console --app uno-online-backend -C "cd /app && npx prisma migrate deploy"

# Step 8: Check health
echo -e "${GREEN}✅ Checking health...${NC}"
sleep 5
flyctl status --app uno-online-backend

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "App URL: https://uno-online-backend.fly.dev"
echo "View logs: flyctl logs --app uno-online-backend"
echo "SSH into app: flyctl ssh console --app uno-online-backend"
echo ""