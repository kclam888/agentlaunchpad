#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}CopyCoder Deployment Checklist${NC}"

# Environment Variables
echo -e "\n${YELLOW}Checking Environment Variables...${NC}"
required_vars=(
  "DATABASE_URL"
  "NEXT_PUBLIC_APP_URL"
  "JWT_SECRET"
  "UPSTASH_REDIS_URL"
  "UPSTASH_REDIS_TOKEN"
  "AWS_ACCESS_KEY_ID"
  "AWS_SECRET_ACCESS_KEY"
  "AWS_REGION"
  "AWS_BACKUP_BUCKET"
  "NEXT_PUBLIC_SENTRY_DSN"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}❌ Missing $var${NC}"
  else
    echo -e "${GREEN}✓ $var is set${NC}"
  fi
done

# Database
echo -e "\n${YELLOW}Checking Database...${NC}"
if npx prisma db push --preview-feature; then
  echo -e "${GREEN}✓ Database schema is up to date${NC}"
else
  echo -e "${RED}❌ Database schema needs migration${NC}"
fi

# Build
echo -e "\n${YELLOW}Checking Build...${NC}"
if npm run build; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
fi

# Tests
echo -e "\n${YELLOW}Running Tests...${NC}"
if npm test; then
  echo -e "${GREEN}✓ All tests passed${NC}"
else
  echo -e "${RED}❌ Tests failed${NC}"
fi

# Cache
echo -e "\n${YELLOW}Checking Redis Connection...${NC}"
if curl -f $UPSTASH_REDIS_URL > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Redis connection successful${NC}"
else
  echo -e "${RED}❌ Redis connection failed${NC}"
fi

# Monitoring
echo -e "\n${YELLOW}Checking Monitoring Setup...${NC}"
if curl -f https://sentry.io/api/0/projects/ -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Sentry connection successful${NC}"
else
  echo -e "${RED}❌ Sentry connection failed${NC}"
fi

# Backup
echo -e "\n${YELLOW}Checking Backup Configuration...${NC}"
if aws s3 ls s3://$AWS_BACKUP_BUCKET > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backup bucket accessible${NC}"
else
  echo -e "${RED}❌ Backup bucket not accessible${NC}"
fi

# Prompts
echo -e "\n${YELLOW}Checking Prompts Configuration...${NC}"
if [ -f "copycoder-prompts/.setup" ]; then
  echo -e "${GREEN}✓ Prompts setup file exists${NC}"
  # Run prompts validation
  if node validate.js; then
    echo -e "${GREEN}✓ Prompts validation passed${NC}"
  else
    echo -e "${RED}❌ Prompts validation failed${NC}"
  fi
else
  echo -e "${RED}❌ Missing prompts setup file${NC}"
fi

# Next.js Configuration
echo -e "\n${YELLOW}Checking Next.js Configuration...${NC}"
if [ -f "next.config.js" ]; then
  echo -e "${GREEN}✓ Next.js config exists${NC}"
  
  # Check for required configurations
  if grep -q "output: 'standalone'" next.config.js; then
    echo -e "${GREEN}✓ Standalone output configured${NC}"
  else
    echo -e "${RED}❌ Missing standalone output configuration${NC}"
  fi
  
  if grep -q "compress: true" next.config.js; then
    echo -e "${GREEN}✓ Compression enabled${NC}"
  else
    echo -e "${YELLOW}⚠️ Compression not enabled${NC}"
  fi
  
  if grep -q "poweredByHeader: false" next.config.js; then
    echo -e "${GREEN}✓ Powered by header disabled${NC}"
  else
    echo -e "${YELLOW}⚠️ Powered by header not disabled${NC}"
  fi
else
  echo -e "${RED}❌ Missing Next.js config${NC}"
fi

# Final Summary
echo -e "\n${YELLOW}Deployment Checklist Summary${NC}"
total_checks=$(grep -c "echo -e" $0)
passed_checks=$(grep -c "✓" $0)
failed_checks=$(grep -c "❌" $0)
warnings=$(grep -c "⚠️" $0)

echo -e "Total Checks: $total_checks"
echo -e "${GREEN}Passed: $passed_checks${NC}"
echo -e "${RED}Failed: $failed_checks${NC}"
echo -e "${YELLOW}Warnings: $warnings${NC}"

if [ $failed_checks -gt 0 ]; then
  echo -e "\n${RED}❌ Deployment checks failed. Please fix the issues above.${NC}"
  exit 1
else
  if [ $warnings -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️ Deployment checks passed with warnings.${NC}"
  else
    echo -e "\n${GREEN}✓ All deployment checks passed successfully!${NC}"
  fi
  exit 0
fi 