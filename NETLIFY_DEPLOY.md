# ClawController - Netlify Deployment Guide

## 🚀 Deploy Rápido

### Opción 1: Netlify Drop (Recomendado - Sin CLI)

1. **El build ya está listo** en: `/home/ncx/.clawcontroller/frontend/dist`

2. **Andá a:** https://app.netlify.com/drop

3. **Arrastrá la carpeta** `frontend/dist` al área de drop

4. **Configurá las variables de entorno:**
   - Site settings → Environment variables → Add variables

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | (URL del backend - ver abajo) |
   | `VITE_OPENCLAW_TOKEN` | `dfb4fada55757c3664799f9d3ff294208ff235165b801d17` |

---

## 🔌 Backend URLs Disponibles

### Opción A: Tailscale Funnel (MEJOR - estable y seguro)

1. Habilitar en: https://login.tailscale.com/f/funnel?node=nvchbc2yJ111CNTRL
2. URL será: `https://ncx.tailnet-name.ts.net:18789`
3. Actualizar `VITE_API_URL` en Netlify

### Opción B: Tunnel Temporal (inestable)

```bash
# Iniciar túnel
lt --port 18789

# Copiar la URL que muestra y actualizar VITE_API_URL
```

⚠️ La URL cambia cada vez que se reinicia el túnel
