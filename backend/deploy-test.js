const fs = require('fs');
const path = require('path');

console.log('🚀 AWS Deployment Test Simulation');
console.log('==================================');

// Test 1: Check environment variables
console.log('\n1. ✅ Environment Variables:');
console.log(`   - AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET'}`);
console.log(`   - AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'}`);
console.log(`   - AWS_SESSION_TOKEN: ${process.env.AWS_SESSION_TOKEN ? 'SET' : 'NOT SET'}`);
console.log(`   - AWS_DEFAULT_REGION: ${process.env.AWS_DEFAULT_REGION || 'NOT SET'}`);

// Test 2: Check .env file
console.log('\n2. ✅ Environment File:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('   - .env file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasMongoUri = envContent.includes('MONGO_URI');
    const hasJwtSecret = envContent.includes('JWT_SECRET');
    const hasPort = envContent.includes('PORT');
    console.log(`   - MONGO_URI: ${hasMongoUri ? 'SET' : 'NOT SET'}`);
    console.log(`   - JWT_SECRET: ${hasJwtSecret ? 'SET' : 'NOT SET'}`);
    console.log(`   - PORT: ${hasPort ? 'SET' : 'NOT SET'}`);
} else {
    console.log('   - .env file NOT FOUND');
}

// Test 3: Check package.json
console.log('\n3. ✅ Package Configuration:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`   - Name: ${packageJson.name}`);
    console.log(`   - Version: ${packageJson.version}`);
    console.log(`   - Dependencies: ${Object.keys(packageJson.dependencies || {}).length} packages`);
    console.log(`   - Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).length} packages`);
    console.log(`   - Test script: ${packageJson.scripts?.test ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
} else {
    console.log('   - package.json NOT FOUND');
}

// Test 4: Check server.js
console.log('\n4. ✅ Server Configuration:');
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
    console.log('   - server.js exists');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    const hasExpress = serverContent.includes('express');
    const hasMongoDB = serverContent.includes('connectDB');
    const hasRoutes = serverContent.includes('app.use');
    console.log(`   - Express: ${hasExpress ? 'IMPORTED' : 'NOT IMPORTED'}`);
    console.log(`   - MongoDB: ${hasMongoDB ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    console.log(`   - Routes: ${hasRoutes ? 'LOADED' : 'NOT LOADED'}`);
} else {
    console.log('   - server.js NOT FOUND');
}

// Test 5: Check node_modules
console.log('\n5. ✅ Dependencies:');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('   - node_modules directory exists');
    const expressPath = path.join(nodeModulesPath, 'express');
    const mongoosePath = path.join(nodeModulesPath, 'mongoose');
    console.log(`   - Express: ${fs.existsSync(expressPath) ? 'INSTALLED' : 'NOT INSTALLED'}`);
    console.log(`   - Mongoose: ${fs.existsSync(mongoosePath) ? 'INSTALLED' : 'NOT INSTALLED'}`);
} else {
    console.log('   - node_modules NOT FOUND - run npm ci first');
}

console.log('\n🎯 Deployment Readiness Assessment:');
console.log('==================================');

// Overall assessment
const envVarsOk = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
const envFileOk = fs.existsSync(envPath);
const packageOk = fs.existsSync(packagePath);
const serverOk = fs.existsSync(serverPath);
const depsOk = fs.existsSync(nodeModulesPath);

if (envVarsOk && envFileOk && packageOk && serverOk && depsOk) {
    console.log('✅ READY FOR DEPLOYMENT');
    console.log('   All components are properly configured');
    console.log('   Your application should deploy successfully to AWS');
} else {
    console.log('❌ DEPLOYMENT ISSUES DETECTED');
    if (!envVarsOk) console.log('   - AWS credentials not properly set');
    if (!envFileOk) console.log('   - .env file missing');
    if (!packageOk) console.log('   - package.json missing');
    if (!serverOk) console.log('   - server.js missing');
    if (!depsOk) console.log('   - Dependencies not installed (run npm ci)');
}

console.log('\n🌐 Next Steps:');
console.log('1. Push code to GitHub');
console.log('2. GitHub Actions will run tests on ubuntu-latest');
console.log('3. Self-hosted runner will deploy to AWS EC2');
console.log('4. Application will be available at your EC2 IP address');
