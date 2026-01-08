#!/bin/bash
echo "🧪 Testing KLINIK-MAT Educational Platform Features"
echo "=================================================="
echo ""

echo "1️⃣ Testing Case Browsing API..."
curl -s http://localhost:3000/api/cases?limit=3 | jq -r '.data[] | "\(.id): \(.title) [\(.area)]"' | head -5
echo ""

echo "2️⃣ Testing Case Count..."
curl -s http://localhost:3000/api/cases | jq '.pagination.total'
echo ""

echo "3️⃣ Testing Subscription Plans..."
curl -s http://localhost:3000/api/subscription/plans | jq '.[] | {name: .name, price: .price, maxCases: .maxCasesPerMonth}'
echo ""

echo "4️⃣ Server logs (last 20 lines)..."
tail -20 dev-server.log | grep -E "(Ready|GET|POST|ERROR|prisma)" | tail -10
