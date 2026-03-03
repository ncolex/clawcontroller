# ClawController - Vercel Deployment Guide

## ✅ Deployment Complete!

- **Frontend**: Deployed to Vercel
- **Backend**: Running locally via OpenClaw Gateway
- **Connection**: Tailscale (configured)
- **Environment Variables**: ✅ Configured

## URLs

| Service | URL |
|---------|-----|
| **Vercel Frontend** | https://clawcontroller.vercel.app |
| **Tailscale Backend** | https://ncx.tail64e30c.ts.net:18789 |

## Environment Variables (Configured)

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_URL` | `https://ncx.tail64e30c.ts.net:18789` | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_OPENCLAW_TOKEN` | `dfb4fada55757c3664799f9d3ff294208ff235165b801d17` | ✅ Production, ✅ Preview, ✅ Development |

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Vercel (SPA)   │────▶│  Tailscale Net   │────▶│  OpenClaw GW    │
│  React + Vite   │     │  Encrypted Tunnel│     │  FastAPI :18789 │
│                 │     │                  │     │  + Auth Token   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Configuration Files Created

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel build configuration |
| `frontend/.env.example` | Environment variable template |
| `frontend/.env.local` | Local development env (Tailscale URL) |
| `frontend/src/api.js` | Updated to use `VITE_API_URL` env var |
| `.vercelignore` | Files to exclude from deployment |

## Environment Variables

### For Local Development
Create `frontend/.env.local`:
```env
VITE_API_URL=https://ncx.tail64e30c.ts.net:18789
```

### For Vercel Dashboard
Set in Vercel project settings:
- **Key**: `VITE_API_URL`
- **Value**: `https://ncx.tail64e30c.ts.net:18789`
- **Environments**: Production, Preview, Development

## Manual Vercel Environment Setup

If the CLI command didn't work, set the environment variable manually:

1. Go to: https://vercel.com/nico-bs-projects/.clawcontroller/settings/environment-variables
2. Click "Add New"
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://ncx.tail64e30c.ts.net:18789`
   - **Environment**: Select all (Production, Preview, Development)
4. Click "Save"
5. Redeploy: `vercel --prod`

## Local Development

```bash
cd /home/ncx/.clawcontroller

# Start backend (OpenClaw Gateway - already running)
openclaw start

# Start frontend dev server
cd frontend
npm run dev
```

## Deployment Commands

```bash
# Deploy to production
cd /home/ncx/.clawcontroller
vercel deploy --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Tailscale Configuration

Your OpenClaw gateway is already configured for Tailscale:

```json
{
  "gateway": {
    "port": 18789,
    "tailscale": {
      "mode": "serve"
    },
    "auth": {
      "allowTailscale": true
    }
  }
}
```

### Verify Tailscale is Running

```bash
tailscale status
```

Expected output:
- Status: Running
- URL: https://ncx.tail64e30c.ts.net

## Troubleshooting

### Frontend shows blank page

This is expected if:
- OpenClaw Gateway is not running locally
- Tailscale is not running
- You're accessing from outside your Tailscale network

The frontend needs the backend API to function. Make sure:
1. OpenClaw Gateway is running: `openclaw start`
2. Tailscale is active: `tailscale status`
3. You have access to the Tailscale network

### Frontend can't connect to backend

1. Verify Tailscale is running: `tailscale status`
2. Check gateway is running: `openclaw status`
3. Test backend URL: `curl -k https://ncx.tail64e30c.ts.net:18789` (should return HTML)
4. Verify environment variables are set in Vercel dashboard

### CORS errors

The OpenClaw gateway should handle CORS automatically. If issues persist:
- Check gateway logs: `openclaw logs`
- Verify `allowTailscale: true` in gateway config

### Build errors

```bash
# Test build locally
cd frontend
npm run build
```

## Notes

- ⚠️ **VITE_** variables are exposed to the client (visible in browser DevTools)
- Backend stays local - only frontend is deployed to Vercel
- Tailscale provides secure tunnel to your local backend
- Gateway port 18789 must remain accessible via Tailscale
