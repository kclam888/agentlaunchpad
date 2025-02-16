#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get deployment version to rollback to
if [ -z "$1" ]; then
  echo -e "${YELLOW}No version specified, rolling back to previous version${NC}"
  VERSION="previous"
else
  VERSION=$1
fi

echo -e "${GREEN}Starting rollback to version: $VERSION${NC}"

# Backup current state
echo -e "\n${YELLOW}Creating backup before rollback...${NC}"
BACKUP_NAME="pre_rollback_$(date +%Y%m%d_%H%M%S)"
if npm run backup:create -- --name=$BACKUP_NAME; then
  echo -e "${GREEN}✓ Backup created: $BACKUP_NAME${NC}"
else
  echo -e "${RED}❌ Backup failed, aborting rollback${NC}"
  exit 1
fi

# Rollback Kubernetes deployment
if [ -n "$KUBERNETES_SERVICE_HOST" ]; then
  echo -e "\n${YELLOW}Rolling back Kubernetes deployment...${NC}"
  if [ "$VERSION" = "previous" ]; then
    kubectl rollout undo deployment/copycoder
  else
    kubectl set image deployment/copycoder copycoder=copycoder:$VERSION
  fi
  
  # Wait for rollout
  if kubectl rollout status deployment/copycoder --timeout=300s; then
    echo -e "${GREEN}✓ Kubernetes rollback successful${NC}"
  else
    echo -e "${RED}❌ Kubernetes rollback failed${NC}"
    exit 1
  fi
fi

# Rollback database if needed
if [ -f "migrations/rollback_$VERSION.sql" ]; then
  echo -e "\n${YELLOW}Rolling back database...${NC}"
  if psql $DATABASE_URL -f "migrations/rollback_$VERSION.sql"; then
    echo -e "${GREEN}✓ Database rollback successful${NC}"
  else
    echo -e "${RED}❌ Database rollback failed${NC}"
    exit 1
  fi
fi

# Clear caches
echo -e "\n${YELLOW}Clearing caches...${NC}"
if curl -X POST $UPSTASH_REDIS_URL/flushall -H "Authorization: Bearer $UPSTASH_REDIS_TOKEN"; then
  echo -e "${GREEN}✓ Cache cleared${NC}"
else
  echo -e "${YELLOW}⚠️ Cache clear failed, continuing...${NC}"
fi

# Verify rollback
echo -e "\n${YELLOW}Verifying rollback...${NC}"

# Check application health
if curl -f http://localhost:3000/api/health; then
  echo -e "${GREEN}✓ Application is healthy${NC}"
else
  echo -e "${RED}❌ Application health check failed${NC}"
  echo -e "${YELLOW}Initiating automatic recovery...${NC}"
  
  # Try to recover
  if [ "$VERSION" = "previous" ]; then
    kubectl rollout undo deployment/copycoder
    echo -e "${YELLOW}Rolled back to previous-previous version${NC}"
  else
    kubectl rollout undo deployment/copycoder
    echo -e "${YELLOW}Rolled back to previous version${NC}"
  fi
  exit 1
fi

echo -e "\n${GREEN}Rollback completed successfully!${NC}" 