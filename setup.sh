#!/bin/bash

# Grok-4 CLI Setup Script
# This script helps users set up the Grok CLI with their API key

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    🤖 GROK-4 CLI SETUP                             "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Check for existing .env file
if [ -f .env ]; then
    echo "ℹ️  Found existing .env file"
    read -p "Do you want to keep your existing configuration? (y/n): " keep_config
    if [ "$keep_config" = "y" ] || [ "$keep_config" = "Y" ]; then
        echo "✓ Keeping existing configuration"
    else
        cp .env.example .env
        echo "✓ Created new .env file from template"
    fi
else
    cp .env.example .env
    echo "✓ Created .env file from template"
fi

echo ""

# Link globally (optional)
read -p "Would you like to install 'grok' as a global command? (y/n): " install_global

if [ "$install_global" = "y" ] || [ "$install_global" = "Y" ]; then
    npm link
    if [ $? -eq 0 ]; then
        echo "✓ Global command 'grok' installed"
        echo ""
        echo "You can now use 'grok' from anywhere!"
    else
        echo "⚠️  Could not install globally (may need sudo)"
        echo "   You can still run: node grok"
    fi
else
    echo "ℹ️  Skipping global installation"
    echo "   Run the CLI with: node grok"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    ✨ SETUP COMPLETE!                              "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Get your API key from: https://console.x.ai"
echo "2. Run: grok config (or node grok config)"
echo "3. Follow the setup wizard to save your API key"
echo ""
echo "Quick start:"
echo "  grok                    # Start interactive chat"
echo "  grok chat \"Hello!\"      # Send a message"
echo "  grok --help             # View all commands"
echo ""
echo "Enjoy using Grok-4 CLI! 🚀"