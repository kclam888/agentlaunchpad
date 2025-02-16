#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Setting up CopyCoder Demo${NC}"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed${NC}" >&2; exit 1; }

# Set up environment variables
echo -e "\n${YELLOW}Setting up environment variables...${NC}"
cat > .env.local << EOL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/copycoder"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="demo-secret-key-change-in-production"
UPSTASH_REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_SENTRY_DSN=""
EOL

# Start dependencies with Docker
echo -e "\n${YELLOW}Starting dependencies...${NC}"
docker-compose up -d postgres redis

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Set up database
echo -e "\n${YELLOW}Setting up database...${NC}"
npx prisma migrate dev

# Build application
echo -e "\n${YELLOW}Building application...${NC}"
npm run build

# Start the application
echo -e "\n${GREEN}Starting CopyCoder...${NC}"
npm run dev

# Print demo information
echo -e "\n${GREEN}Demo is running!${NC}"
echo -e "Access the application at: ${YELLOW}http://localhost:3000${NC}"
echo -e "Default admin credentials:"
echo -e "Email: ${YELLOW}admin@copycoder.com${NC}"
echo -e "Password: ${YELLOW}admin123${NC}" 