# OpenClaw & ClawController Master Config

> **Respaldo Vital en Google Drive**  
> **Carpeta:** AI_Projects_Backup  
> **Última actualización:** 2026-02-28

---

## 🌐 URLs Importantes

| Servicio | URL |
|----------|-----|
| **Vercel (Producción)** | https://clawcontroller.vercel.app |
| **Tailscale** | https://ncx.tailnet.ts.net |
| **Local Frontend** | http://localhost:5001 |
| **Local Backend** | http://localhost:8000 |
| **Ollama API** | http://localhost:11434 |

---

## 🔑 Tokens de Acceso

```
VITE_OPENCLAW_TOKEN=dfb4fada55757c3664799f9d3ff294208ff235165b801d17
```

> ⚠️ **Importante:** Este token está también guardado en `.env.local`

---

## 📁 Rutas de Archivos de Configuración

| Archivo | Ruta |
|---------|------|
| OpenClaw Config | `/home/ncx/.openclaw/openclaw.json` |
| ClawController Config | `/home/ncx/.clawcontroller/vercel.json` |
| ClawController Data | `/home/ncx/.clawcontroller/data/` |
| Ollama Models | `/home/ncx/.ollama/models/` |
| Backend Log | `/home/ncx/.clawcontroller/logs/backend.log` |
| OpenClaw Logs | `/home/ncx/.openclaw/logs/` |
| Backup Config | `/home/ncx/.clawcontroller/BACKUP_CONFIG.json` |

---

## 🚀 Instrucciones de Despliegue

### Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend        │────▶│   Ollama        │
│   Vercel        │     │   Local:8000     │     │   Local:11434   │
│   (React+Vite)  │     │   (FastAPI)      │     │   (AI Models)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         └───────────────────────┘
              Cloudflare Tunnel
```

### Comandos de Deploy

```bash
# Deploy Frontend a Vercel
cd /home/ncx/.clawcontroller && vercel --prod --yes

# Iniciar Backend
cd /home/ncx/.clawcontroller/backend && source venv/bin/activate && \
  python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Iniciar Cloudflare Tunnel
/tmp/cloudflared tunnel --url http://localhost:8000

# Actualizar URL del túnel en Vercel
# Editar: /home/ncx/.clawcontroller/vercel.json
# Cambiar: rewrites.destination con la nueva URL del túnel
```

---

## ⚙️ Servicios Systemd

### Auto-Inicio Configurado

| Servicio | Estado | Auto-Start |
|----------|--------|------------|
| **Ollama** | `ollama.service` | ✅ Enabled |
| **ClawController** | `clawcontroller.service` | ✅ Enabled |

### Lingering (Auto-arranque sin login)

```bash
# Verificar estado
loginctl show-user ncx -p Linger

# Habilitar (si no está habilitado)
sudo loginctl enable-linger ncx
```

**Estado actual:** ✅ Habilitado para usuario `ncx`

---

## 🤖 Agentes Configurados

| ID | Nombre | Modelo |
|----|--------|--------|
| `triage` | Triage | qwen-portal/coder-model |
| `developer` | DevBot | qwen-portal/coder-model |
| `api-watchdog` | Watchdog | ollama/phi3 |
| `orchestrator` | Orchestrator | groq/llama-3.1-70b-versatile |
| `crypto` | CryptoBot | ollama/rnj-1:8b-cloud |

---

## 🧠 Modelos Ollama Instalados

- `llama2:latest` (7B, Q4_0)
- `gemma3:1b` (999.89M, Q4_K_M)
- `orca-mini:latest` (3B, Q4_0)
- `tinyllama:latest` (1B, Q4_0)
- `gemma2:2b` (2.6B, Q4_0)
- `llama3:latest` (8.0B, Q4_0)
- `mistral:latest` (7.2B, Q4_K_M)
- `phi3:latest` (3.8B, Q4_0)
- `functiongemma:latest` (268.10M, Q8_0)
- `smollm2:135m` (134.52M, F16)

**Total:** 10 modelos locales (~19.25 GB)

---

## 📊 Estado Actual

### Servicios

| Servicio | Estado | PID |
|----------|--------|-----|
| **Ollama** | ✅ Corriendo | 23391 |
| **ClawController** | ✅ Corriendo | Backend + Frontend |
| **Vercel** | ✅ Desplegado | - |

### Panel de Control

- **Frontend:** https://clawcontroller.vercel.app
- **Funcionalidades:**
  - Real-Time Agent Monitor
  - Agent Activity Charts
  - Kanban Board
  - Subagents Panel
  - Ollama Status Panel
  - Backup Panel

---

## 📝 Notas

1. **Backup en Google Drive:**
   - Carpeta: `AI_Projects_Backup`
   - Documento: `OpenClaw & ClawController Master Config`
   
2. **Túnel Cloudflare:**
   - La URL cambia cada vez que se reinicia
   - Actualizar en `vercel.json` después de cada reinicio
   
3. **API Keys:**
   - Todas las API keys están en `/home/ncx/.openclaw/openclaw.json`
   - Backup incluye referencias pero NO las keys completas por seguridad

---

**Creado:** 2026-02-28  
**Actualizado:** 2026-02-28  
**Versión:** 1.0
