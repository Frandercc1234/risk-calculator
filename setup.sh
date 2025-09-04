#!/bin/bash

echo "🚀 Setting up Risk Calculator..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build shared package
echo "🔨 Building shared package..."
pnpm -C packages/shared build

# Create data directory for API
echo "📁 Creating data directory..."
mkdir -p apps/api/data

# Copy environment files
echo "⚙️ Setting up environment files..."
if [ ! -f apps/api/.env ]; then
    echo "PORT=3001" > apps/api/.env
    echo "PERSIST_PATH=./data/risks.json" >> apps/api/.env
    echo "CORS_ORIGIN=http://localhost:5173" >> apps/api/.env
    echo "✅ Created apps/api/.env"
fi

if [ ! -f apps/web/.env ]; then
    echo "VITE_API_BASE=http://localhost:3001/api" > apps/web/.env
    echo "✅ Created apps/web/.env"
fi

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  pnpm dev"
echo ""
echo "To run tests:"
echo "  pnpm test"
echo ""
echo "To build for production:"
echo "  pnpm build"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001/api"

