#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting Performance Benchmark${NC}"

# Configuration
ENDPOINT="http://localhost:3000"
CONCURRENT_USERS=50
DURATION=60
TIMEOUT=10

# Install dependencies if needed
if ! command -v hey &> /dev/null; then
  echo -e "${YELLOW}Installing hey for load testing...${NC}"
  go get -u github.com/rakyll/hey
fi

# Run benchmarks
echo -e "\n${YELLOW}Testing API endpoints...${NC}"

# Test endpoints
endpoints=(
  "/api/health"
  "/api/workflows"
  "/api/agents"
)

for endpoint in "${endpoints[@]}"; do
  echo -e "\n${YELLOW}Testing $endpoint...${NC}"
  
  hey -n 1000 -c $CONCURRENT_USERS -z $DURATION\s -t $TIMEOUT \
    -H "Authorization: Bearer $TEST_TOKEN" \
    "$ENDPOINT$endpoint" > "benchmark_${endpoint//\//_}.txt"
  
  # Parse results
  p95=$(grep "95%" "benchmark_${endpoint//\//_}.txt" | awk '{print $2}')
  rps=$(grep "Requests/sec" "benchmark_${endpoint//\//_}.txt" | awk '{print $2}')
  
  echo -e "P95 Latency: ${GREEN}$p95${NC}"
  echo -e "Requests/sec: ${GREEN}$rps${NC}"
  
  # Check against thresholds
  if (( $(echo "$p95 > 500" | bc -l) )); then
    echo -e "${RED}⚠️ P95 latency above threshold (500ms)${NC}"
  fi
  
  if (( $(echo "$rps < 100" | bc -l) )); then
    echo -e "${RED}⚠️ Throughput below threshold (100 rps)${NC}"
  fi
done

# Memory usage
echo -e "\n${YELLOW}Checking memory usage...${NC}"
kubectl top pods -l app=copycoder

# CPU usage
echo -e "\n${YELLOW}Checking CPU usage...${NC}"
kubectl top pods -l app=copycoder

# WebSocket Testing
echo -e "\n${YELLOW}Testing WebSocket connections...${NC}"

# Install wscat if needed
if ! command -v wscat &> /dev/null; then
  echo -e "${YELLOW}Installing wscat for WebSocket testing...${NC}"
  npm install -g wscat
fi

# Test WebSocket connections
WS_ENDPOINT="ws://localhost:3000/api/ws"
WS_CONNECTIONS=100
WS_DURATION=30

echo "Testing $WS_CONNECTIONS concurrent WebSocket connections for ${WS_DURATION}s"

# Create WebSocket load test script
cat << EOF > ws_test.js
const WebSocket = require('ws');
const connections = [];
let messageCount = 0;
let errorCount = 0;

for (let i = 0; i < $WS_CONNECTIONS; i++) {
  const ws = new WebSocket('$WS_ENDPOINT');
  
  ws.on('open', () => {
    ws.send(JSON.stringify({ type: 'ping' }));
  });
  
  ws.on('message', () => {
    messageCount++;
  });
  
  ws.on('error', () => {
    errorCount++;
  });
  
  connections.push(ws);
}

setTimeout(() => {
  console.log(JSON.stringify({
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.readyState === 1).length,
    messageCount,
    errorCount
  }));
  process.exit(0);
}, ${WS_DURATION}000);
EOF

# Run WebSocket test
WS_RESULTS=$(node ws_test.js)
echo -e "\nWebSocket Test Results:"
echo $WS_RESULTS | jq '.'

# Resource Optimization Suggestions
echo -e "\n${YELLOW}Generating Resource Optimization Suggestions...${NC}"

# Analyze CPU usage
CPU_USAGE=$(kubectl top pods -l app=copycoder --no-headers | awk '{print $2}' | sed 's/m//')
if [ $CPU_USAGE -gt 800 ]; then
  echo -e "${RED}⚠️ High CPU usage detected ($CPU_USAGE mCPU)${NC}"
  echo -e "Suggestions:"
  echo -e "- Enable caching for frequently accessed data"
  echo -e "- Implement request batching"
  echo -e "- Consider horizontal scaling"
fi

# Analyze memory usage
MEMORY_USAGE=$(kubectl top pods -l app=copycoder --no-headers | awk '{print $3}' | sed 's/Mi//')
if [ $MEMORY_USAGE -gt 1024 ]; then
  echo -e "${RED}⚠️ High memory usage detected ($MEMORY_USAGE MB)${NC}"
  echo -e "Suggestions:"
  echo -e "- Check for memory leaks"
  echo -e "- Optimize large object allocations"
  echo -e "- Consider implementing memory limits"
fi

# Analyze response times
AVG_LATENCY=$(cat benchmark_*.txt | grep "Average" | awk '{sum+=$2} END {print sum/NR}')
if (( $(echo "$AVG_LATENCY > 200" | bc -l) )); then
  echo -e "${RED}⚠️ High average latency detected ($AVG_LATENCY ms)${NC}"
  echo -e "Suggestions:"
  echo -e "- Implement database query optimization"
  echo -e "- Add Redis caching"
  echo -e "- Consider CDN for static assets"
fi

# Generate report
echo -e "\n${YELLOW}Generating benchmark report...${NC}"
cat << EOF > benchmark_report.md
# Performance Benchmark Report

Date: $(date)
Environment: $(kubectl config current-context)

## API Endpoints

$(for endpoint in "${endpoints[@]}"; do
  echo "### $endpoint"
  echo "\`\`\`"
  cat "benchmark_${endpoint//\//_}.txt"
  echo "\`\`\`"
done)

## Resource Usage

\`\`\`
$(kubectl top pods -l app=copycoder)
\`\`\`

## WebSocket Performance

\`\`\`json
$WS_RESULTS
\`\`\`

## Resource Optimization Suggestions

### CPU Usage
- Current Usage: $CPU_USAGE mCPU
$(if [ $CPU_USAGE -gt 800 ]; then
  echo "- ⚠️ High CPU usage detected"
  echo "- Consider implementing caching and request batching"
fi)

### Memory Usage
- Current Usage: $MEMORY_USAGE MB
$(if [ $MEMORY_USAGE -gt 1024 ]; then
  echo "- ⚠️ High memory usage detected"
  echo "- Consider memory optimization and leak detection"
fi)

### Response Times
- Average Latency: $AVG_LATENCY ms
$(if (( $(echo "$AVG_LATENCY > 200" | bc -l) )); then
  echo "- ⚠️ High latency detected"
  echo "- Consider query optimization and caching"
fi)

## Recommendations

1. Performance Improvements
   - Implement caching for frequently accessed data
   - Optimize database queries
   - Consider horizontal scaling

2. Resource Management
   - Set appropriate resource limits
   - Implement auto-scaling
   - Monitor memory usage

3. Monitoring
   - Set up alerts for resource thresholds
   - Monitor WebSocket connection stability
   - Track error rates
EOF

# Workflow-specific load testing
echo -e "\n${YELLOW}Testing specific workflows...${NC}"

# Define test workflows
declare -A workflows=(
  ["create-agent"]='{"name":"test-agent","type":"openai","config":{}}'
  ["run-workflow"]='{"name":"test-workflow","steps":[{"type":"text","input":"test"}]}'
  ["chain-execution"]='{"steps":[{"type":"text"},{"type":"code"},{"type":"test"}]}'
)

for workflow in "${!workflows[@]}"; do
  echo -e "\n${YELLOW}Testing $workflow workflow...${NC}"
  
  hey -n 100 -c 10 -m POST -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEST_TOKEN" \
    -d "${workflows[$workflow]}" \
    "$ENDPOINT/api/workflows/$workflow" > "benchmark_workflow_${workflow}.txt"
    
  # Parse workflow-specific results
  duration=$(grep "Total:" "benchmark_workflow_${workflow}.txt" | awk '{print $2}')
  success_rate=$(grep "Success" "benchmark_workflow_${workflow}.txt" | awk '{print $2}')
  
  echo -e "Duration: ${GREEN}${duration}s${NC}"
  echo -e "Success Rate: ${GREEN}${success_rate}%${NC}"
done

# Performance regression testing
echo -e "\n${YELLOW}Running performance regression tests...${NC}"

# Load previous benchmark results
PREV_RESULTS_FILE="benchmark_history.json"
if [ -f $PREV_RESULTS_FILE ]; then
  PREV_RESULTS=$(cat $PREV_RESULTS_FILE)
  
  # Compare with current results
  echo -e "\nPerformance Changes:"
  
  # Compare API endpoints
  for endpoint in "${endpoints[@]}"; do
    curr_p95=$(grep "95%" "benchmark_${endpoint//\//_}.txt" | awk '{print $2}')
    prev_p95=$(echo $PREV_RESULTS | jq -r ".endpoints.\"$endpoint\".p95")
    
    change=$(echo "scale=2; (($curr_p95 - $prev_p95) / $prev_p95) * 100" | bc)
    
    if (( $(echo "$change > 10" | bc -l) )); then
      echo -e "${RED}⚠️ $endpoint: Performance degraded by ${change}%${NC}"
    elif (( $(echo "$change < -10" | bc -l) )); then
      echo -e "${GREEN}✓ $endpoint: Performance improved by ${change#-}%${NC}"
    else
      echo -e "ℹ️ $endpoint: Performance stable (${change}% change)"
    fi
  done
  
  # Compare WebSocket performance
  prev_ws_conn=$(echo $PREV_RESULTS | jq -r '.websocket.activeConnections')
  curr_ws_conn=$(echo $WS_RESULTS | jq -r '.activeConnections')
  
  ws_change=$(echo "scale=2; (($curr_ws_conn - $prev_ws_conn) / $prev_ws_conn) * 100" | bc)
  
  echo -e "\nWebSocket Connection Changes:"
  if (( $(echo "$ws_change < -5" | bc -l) )); then
    echo -e "${RED}⚠️ WebSocket capacity decreased by ${ws_change#-}%${NC}"
  else
    echo -e "${GREEN}✓ WebSocket capacity stable/improved${NC}"
  fi
fi

# Save current results for future comparison
cat << EOF > $PREV_RESULTS_FILE
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "endpoints": {
    $(for endpoint in "${endpoints[@]}"; do
      echo "\"$endpoint\": {"
      echo "  \"p95\": \"$(grep "95%" "benchmark_${endpoint//\//_}.txt" | awk '{print $2}')\","
      echo "  \"rps\": \"$(grep "Requests/sec" "benchmark_${endpoint//\//_}.txt" | awk '{print $2}')\""
      echo "},"
    done)
  },
  "websocket": $WS_RESULTS,
  "resources": {
    "cpu": "$CPU_USAGE",
    "memory": "$MEMORY_USAGE"
  }
}
EOF

# Add regression analysis to report
cat << EOF >> benchmark_report.md

## Performance Regression Analysis

### API Endpoints
$(for endpoint in "${endpoints[@]}"; do
  echo "#### $endpoint"
  if [ -f $PREV_RESULTS_FILE ]; then
    curr_p95=$(grep "95%" "benchmark_${endpoint//\//_}.txt" | awk '{print $2}')
    prev_p95=$(echo $PREV_RESULTS | jq -r ".endpoints.\"$endpoint\".p95")
    change=$(echo "scale=2; (($curr_p95 - $prev_p95) / $prev_p95) * 100" | bc)
    echo "- Previous P95: ${prev_p95}ms"
    echo "- Current P95: ${curr_p95}ms"
    echo "- Change: ${change}%"
  else
    echo "- No previous data available"
  fi
done)

### Workflow Performance
$(for workflow in "${!workflows[@]}"; do
  echo "#### $workflow"
  echo "\`\`\`"
  cat "benchmark_workflow_${workflow}.txt"
  echo "\`\`\`"
done)
EOF

echo -e "\n${GREEN}Performance regression analysis completed!${NC}"

echo -e "\n${GREEN}Benchmark and optimization analysis completed!${NC}" 