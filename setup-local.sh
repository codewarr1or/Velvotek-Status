#!/bin/bash

echo "Setting up Velvotek Status for local hosting..."
echo "============================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js version 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Warning: Node.js version 18 or higher is recommended. Current version: $(node -v)"
fi

echo "✓ Node.js detected: $(node -v)"

# Replace vite.config.ts with local version
if [ -f "vite.config.local.ts" ]; then
    echo "✓ Replacing vite.config.ts with local version..."
    mv vite.config.ts vite.config.ts.backup
    mv vite.config.local.ts vite.config.ts
    echo "  Original file backed up as vite.config.ts.backup"
else
    echo "Warning: vite.config.local.ts not found"
fi

# Install dependencies
echo "✓ Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo ""
echo "Setup complete! 🎉"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo "  npm start"
echo ""
echo "The application will be available at http://localhost:5000"
echo ""
echo "For more information, see README-LOCAL-SETUP.md"