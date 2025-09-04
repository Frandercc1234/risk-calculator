# Risk Calculator Setup Script

Write-Host "🚀 Setting up Risk Calculator..." -ForegroundColor Green

# Check if pnpm is installed
try {
    pnpm --version | Out-Null
    Write-Host "✅ pnpm is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm is not installed. Please install pnpm first:" -ForegroundColor Red
    Write-Host "npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pnpm install

# Build shared package
Write-Host "🔨 Building shared package..." -ForegroundColor Blue
pnpm -C packages/shared build

# Create data directory for API
Write-Host "📁 Creating data directory..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "apps/api/data" | Out-Null

# Copy environment files
Write-Host "⚙️ Setting up environment files..." -ForegroundColor Blue

if (!(Test-Path "apps/api/.env")) {
    @"
PORT=3001
PERSIST_PATH=./data/risks.json
CORS_ORIGIN=http://localhost:5173
"@ | Out-File -FilePath "apps/api/.env" -Encoding UTF8
    Write-Host "✅ Created apps/api/.env" -ForegroundColor Green
}

if (!(Test-Path "apps/web/.env")) {
    @"
VITE_API_BASE=http://localhost:3001/api
"@ | Out-File -FilePath "apps/web/.env" -Encoding UTF8
    Write-Host "✅ Created apps/web/.env" -ForegroundColor Green
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development:" -ForegroundColor Yellow
Write-Host "  pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "To run tests:" -ForegroundColor Yellow
Write-Host "  pnpm test" -ForegroundColor White
Write-Host ""
Write-Host "To build for production:" -ForegroundColor Yellow
Write-Host "  pnpm build" -ForegroundColor White
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001/api" -ForegroundColor White

