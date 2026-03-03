#!/bin/bash
# ClawController - Deploy to Vercel with public tunnel

set -e

echo "🚀 ClawController Vercel Deployer"
echo "=================================="

# Kill any existing tunnels
pkill -f "cloudflared tunnel" 2>/dev/null || true
pkill ngrok 2>/dev/null || true

# Try cloudflare first
echo "📡 Starting Cloudflare tunnel..."
/tmp/cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflared.log 2>&1 &
CLOUDFLARED_PID=$!

# Wait for tunnel to start
sleep 10

# Get tunnel URL
TUNNEL_URL=$(grep -oP 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' /tmp/cloudflared.log 2>/dev/null | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Cloudflare tunnel failed. Trying ngrok..."
    kill $CLOUDFLARED_PID 2>/dev/null || true
    
    ngrok http 8000 --log=stdout > /tmp/ngrok.log 2>&1 &
    NGROK_PID=$!
    sleep 8
    
    TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url')
fi

if [ -z "$TUNNEL_URL" ] || [ "$TUNNEL_URL" == "null" ]; then
    echo "❌ Failed to start any tunnel"
    exit 1
fi

echo "✅ Tunnel URL: $TUNNEL_URL"

# Update Vercel
cd /home/ncx/.clawcontroller

echo "📦 Updating Vercel environment..."
vercel env rm VITE_API_URL production --yes 2>/dev/null || true
vercel env rm VITE_API_URL preview --yes 2>/dev/null || true
vercel env rm VITE_API_URL development --yes 2>/dev/null || true

printf "$TUNNEL_URL\n" | vercel env add VITE_API_URL production 2>/dev/null
printf "$TUNNEL_URL\n" | vercel env add VITE_API_URL preview 2>/dev/null
printf "$TUNNEL_URL\n" | vercel env add VITE_API_URL development 2>/dev/null

echo "🚀 Deploying to Vercel..."
vercel deploy --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Frontend: https://clawcontroller.vercel.app"
echo "🔌 Backend: $TUNNEL_URL"
echo ""
echo "⚠️  Keep this terminal open to maintain the tunnel"
echo "   Press Ctrl+C to stop"

# Keep tunnel running
wait $CLOUDFLARED_PID 2>/dev/null || wait $NGROK_PID 2>/dev/null
