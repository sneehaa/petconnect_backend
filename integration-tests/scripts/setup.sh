#!/bin/bash

echo "🚀 Setting up PetConnect Integration Tests"
echo "=========================================="


echo "📦 Installing dependencies..."
npm install


echo "🗄️  Creating test databases..."
echo "Note: These commands create databases using your macOS username"


USERNAME=$(whoami)
echo "Your username: $USERNAME"

databases=("user_test" "pet_test" "adoption_test" "payment_test" "notification_test" "business_test")

for db in "${databases[@]}"; do
    if createdb "$db" 2>/dev/null; then
        echo "✅ Created database: $db"
    else
        echo "ℹ️  Database $db already exists or error (that's OK)"
    fi
done

echo ""
echo "🔍 Checking services..."
services=("http://localhost:3000" "http://localhost:3001" "http://localhost:3002" "http://localhost:3003")

for service in "${services[@]}"; do
    if curl -s --head --request GET "$service" | grep "200\|404\|405" > /dev/null; then
        echo "✅ $service is responding"
    else
        echo "⚠️  $service might not be running"
    fi
done

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To run tests:"
echo "   npm test                           # Run all tests"
echo "   npm run test:simple               # Run simple test"
echo ""
echo "To start services (in separate terminals):"
echo "   cd ../user-service && npm run dev"
echo "   cd ../pet-service && npm run dev"
echo "   cd ../adoption-service && npm run dev"
echo "   cd ../payment-service && npm run dev"
