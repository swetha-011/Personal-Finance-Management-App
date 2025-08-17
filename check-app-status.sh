#!/bin/bash

echo "🔍 Checking Personal Finance Management App Status"
echo "=================================================="

echo ""
echo "📋 System Information:"
echo "Hostname: $(hostname)"
echo "IP Address: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "Date: $(date)"

echo ""
echo "🔧 Checking PM2 Status:"
if command -v pm2 &> /dev/null; then
    echo "PM2 is installed"
    pm2 list
    echo ""
    echo "PM2 Logs:"
    pm2 logs --lines 10
else
    echo "PM2 is not installed"
fi

echo ""
echo "🌐 Checking Port 5001:"
if netstat -tlnp | grep :5001; then
    echo "✅ Port 5001 is listening"
else
    echo "❌ Port 5001 is not listening"
fi

echo ""
echo "📁 Checking Application Files:"
if [ -d "/home/ubuntu/backend" ]; then
    echo "✅ Backend directory exists"
    ls -la /home/ubuntu/backend/
    
    if [ -f "/home/ubuntu/backend/server.js" ]; then
        echo "✅ server.js exists"
    else
        echo "❌ server.js not found"
    fi
    
    if [ -f "/home/ubuntu/backend/.env" ]; then
        echo "✅ .env file exists"
    else
        echo "❌ .env file not found"
    fi
else
    echo "❌ Backend directory not found"
fi

echo ""
echo "🔄 Checking Node.js Processes:"
ps aux | grep node

echo ""
echo "📊 Memory and Disk Usage:"
df -h
free -h

echo ""
echo "🔍 Checking Recent Logs:"
tail -20 /var/log/syslog | grep -i "node\|pm2\|error"
