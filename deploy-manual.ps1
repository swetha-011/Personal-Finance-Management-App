# Manual Deployment Script for Personal Finance Management App
# This script prepares your application for deployment to AWS EC2

Write-Host "🚀 Manual Deployment Preparation" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Step 1: Check if we're in the right directory
$currentDir = Get-Location
Write-Host "`n📍 Current Directory: $currentDir" -ForegroundColor Yellow

if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the Personal-Finance-Management-App directory" -ForegroundColor Red
    exit 1
}

# Step 2: Prepare backend for deployment
Write-Host "`n📦 Preparing Backend for Deployment..." -ForegroundColor Cyan
Set-Location "backend"

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing - creating one..." -ForegroundColor Yellow
    @"
MONGO_URI=mongodb+srv://swethadonthi:5mU4mYRVGNuKSp2c@cluster0.lp7otm9.mongodb.net/personal-finance-management-app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=73RVFkY/xM0J/o7keLdIYmajCjjXY8pXZnopebJwpew=
PORT=5001
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n📥 Installing Dependencies..." -ForegroundColor Cyan
npm ci
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Test the application
Write-Host "`n🧪 Testing Application..." -ForegroundColor Cyan
npm test
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Tests failed" -ForegroundColor Red
    exit 1
}

# Step 3: Create deployment package
Write-Host "`n📦 Creating Deployment Package..." -ForegroundColor Cyan
Set-Location ".."

# Create a deployment directory
$deployDir = "deployment-package"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy backend files
Copy-Item "backend" -Destination "$deployDir/backend" -Recurse
Copy-Item ".github" -Destination "$deployDir/.github" -Recurse -ErrorAction SilentlyContinue

Write-Host "✅ Deployment package created in: $deployDir" -ForegroundColor Green

# Step 4: Create deployment instructions
$instructions = @"
🚀 MANUAL DEPLOYMENT INSTRUCTIONS
================================

Your application is ready for deployment!

📦 DEPLOYMENT PACKAGE: $deployDir

🌐 TARGET SERVER: 52.62.123.25 (AWS EC2)

📋 DEPLOYMENT STEPS:
1. Upload the deployment package to your EC2 instance
2. SSH into your EC2 instance: ssh -i 'Finance Management.pem' ubuntu@52.62.123.25
3. Navigate to the backend directory
4. Run: npm ci
5. Run: pm2 start server.js --name personal-finance-backend
6. Run: pm2 save

🌐 LIVE SERVER URL: http://52.62.123.25:5001

📋 API ENDPOINTS:
- POST /api/auth/register
- POST /api/auth/login  
- GET /api/transactions
- POST /api/transactions
- GET /api/budgets
- POST /api/budgets
- GET /api/savings-goals
- POST /api/savings-goals

🔧 TROUBLESHOOTING:
- If SSH times out, check EC2 security groups
- Ensure port 5001 is open in security group
- Check if PM2 is installed: npm install -g pm2

✅ Your application is ready for deployment!
"@

$instructions | Out-File -FilePath "$deployDir/DEPLOYMENT_INSTRUCTIONS.txt" -Encoding UTF8
Write-Host "✅ Deployment instructions saved to: $deployDir/DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Green

# Step 5: Display summary
Write-Host "`n🎯 DEPLOYMENT SUMMARY" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green
Write-Host "✅ Backend prepared and tested" -ForegroundColor Green
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host "✅ Environment configured" -ForegroundColor Green
Write-Host "✅ Deployment package created" -ForegroundColor Green
Write-Host "✅ Instructions generated" -ForegroundColor Green

Write-Host "`n🌐 Your live server will be available at:" -ForegroundColor Yellow
Write-Host "   http://52.62.123.25:5001" -ForegroundColor Cyan

Write-Host "`n📁 Deployment package location:" -ForegroundColor Yellow
Write-Host "   $((Get-Location).Path)\$deployDir" -ForegroundColor Cyan

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Upload the deployment package to your EC2 instance" -ForegroundColor White
Write-Host "2. Follow the instructions in DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor White
Write-Host "3. Your API will be live at http://52.62.123.25:5001" -ForegroundColor White

Write-Host "`n🎉 Deployment preparation complete!" -ForegroundColor Green
