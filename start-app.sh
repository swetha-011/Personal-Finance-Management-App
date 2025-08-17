#!/bin/bash

echo "🚀 Starting Personal Finance Management App"
echo "==========================================="

# Navigate to backend directory
cd /home/ubuntu/backend

echo ""
echo "📁 Current directory: $(pwd)"
echo "📋 Files in directory:"
ls -la

echo ""
echo "🔧 Checking if .env exists:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "📄 .env contents:"
    cat .env
else
    echo "❌ .env file not found - creating one"
    cat > .env << EOF
MONGO_URI=mongodb+srv://swethadonthi:5mU4mYRVGNuKSp2c@cluster0.lp7otm9.mongodb.net/personal-finance-management-app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=73RVFkY/xM0J/o7keLdIYmajCjjXY8pXZnopebJwpew=
PORT=5001
EOF
    echo "✅ .env file created"
fi

echo ""
echo "📦 Installing dependencies:"
npm ci

echo ""
echo "🧪 Running tests:"
npm test

echo ""
echo "🔧 Installing PM2 globally:"
npm install -g pm2

echo ""
echo "🛑 Stopping any existing PM2 processes:"
pm2 stop all || true
pm2 delete all || true

echo ""
echo "🚀 Starting the application with PM2:"
pm2 start server.js --name personal-finance-backend

echo ""
echo "💾 Saving PM2 configuration:"
pm2 save

echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "📋 PM2 Logs:"
pm2 logs personal-finance-backend --lines 5

echo ""
echo "🌐 Checking if port 5001 is listening:"
sleep 3
if netstat -tlnp | grep :5001; then
    echo "✅ Application is running on port 5001"
    echo "🌐 Your API is live at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5001"
else
    echo "❌ Application is not listening on port 5001"
    echo "📋 Checking PM2 logs for errors:"
    pm2 logs personal-finance-backend --lines 10
fi

echo ""
echo "🎉 Deployment complete!"
