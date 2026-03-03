#!/bin/bash
# ClawController - Auto-update Vercel with current tunnel URL

set -e

echo "🔄 ClawController Tunnel Updater"
echo "================================"

# Get current tunnel URL
TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null)

if [ -z "$TUNNEL_URL" ] || [ "$TUNNEL_URL" == "null" ]; then
    echo "❌ No tunnel found. Starting ngrok..."
    pkill ngrok 2>/dev/null || true
    ngrok http 8000 --log=stdout > /tmp/ngrok.log 2>&1 &
    sleep 8
    TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
fi

echo "✅ Tunnel URL: $TUNNEL_URL"

# Update Vercel environment variable
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
echo "Frontend: https://clawcontroller.vercel.app"
echo "Backend: $TUNNEL_URL"
