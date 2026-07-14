#!/bin/bash
# Production Deployment Fix Script
# Run this on the production server to fix sidebar menu issues

set -e

echo "=== Dashboard Production Deployment Fix ==="
echo ""

# Step 1: Navigate to repo
cd /opt/schooliat/repo
echo "✓ Current directory: $(pwd)"

# Step 2: Pull latest code
echo ""
echo "1. Pulling latest code from main branch..."
git fetch origin main
git checkout main
git reset --hard origin/main
echo "✓ Code updated to latest main"

# Step 3: Build dashboard
echo ""
echo "2. Building dashboard..."
cd dashboard

# Install dependencies
echo "   Installing dependencies..."
npm ci

# Load environment
echo "   Loading production environment..."
if [ -f /opt/schooliat/dashboard/production/shared/.env ]; then
    cp /opt/schooliat/dashboard/production/shared/.env .env.production
    echo "   ✓ Environment file loaded"
else
    echo "   ⚠ Warning: .env file not found at /opt/schooliat/dashboard/production/shared/.env"
fi

# Build
echo "   Building Next.js app..."
NODE_ENV=production npm run build
echo "✓ Build complete"

# Step 4: Verify build contains changes
echo ""
echo "3. Verifying build contains new menu items..."
if grep -r "Reports & Analytics" .next/ 2>/dev/null | head -1 > /dev/null; then
    echo "   ✓ Build contains 'Reports & Analytics'"
else
    echo "   ⚠ Warning: 'Reports & Analytics' not found in build"
fi

if grep -r "STUDENTS_SUBMENU" .next/ 2>/dev/null | head -1 > /dev/null; then
    echo "   ✓ Build contains 'STUDENTS_SUBMENU'"
else
    echo "   ⚠ Warning: 'STUDENTS_SUBMENU' not found in build"
fi

# Step 5: Copy build to production
echo ""
echo "4. Copying build to production directory..."
rm -rf /opt/schooliat/dashboard/production/.next
cp -r .next /opt/schooliat/dashboard/production/
cp -r public /opt/schooliat/dashboard/production/ 2>/dev/null || true
cp package.json /opt/schooliat/dashboard/production/
echo "✓ Build copied"

# Step 6: Clear Next.js cache
echo ""
echo "5. Clearing Next.js cache..."
rm -rf /opt/schooliat/dashboard/production/.next/cache
echo "✓ Cache cleared"

# Step 7: Restart PM2
echo ""
echo "6. Restarting PM2 process..."
pm2 restart schooliat-dashboard-production --update-env
echo "✓ PM2 restarted"

# Step 8: Wait a moment for restart
sleep 3

# Step 9: Check PM2 status
echo ""
echo "7. PM2 Status:"
pm2 status schooliat-dashboard-production

# Step 10: Final verification
echo ""
echo "8. Final verification..."
if grep -r "Reports & Analytics" /opt/schooliat/dashboard/production/.next/ 2>/dev/null | head -1 > /dev/null; then
    echo "   ✅ Production build contains new menu items!"
else
    echo "   ❌ Production build does NOT contain new menu items"
    echo "   Check build logs above for errors"
fi

echo ""
echo "=== Deployment Fix Complete ==="
echo ""
echo "Next steps:"
echo "1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Test in incognito/private window"
echo "3. Check app.schooliat.com"
echo ""
echo "If issues persist, check PM2 logs:"
echo "  pm2 logs schooliat-dashboard-production --lines 50"

