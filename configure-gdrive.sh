#!/bin/bash
# Configurar rclone con Google Drive

echo "=== Configuración de rclone para Google Drive ==="
echo ""
echo "Para configurar Google Drive, necesitás:"
echo "1. Abrir el navegador y autenticarte con tu cuenta de Google"
echo "2. Copiar el código de autenticación"
echo "3. Pegarlo abajo"
echo ""

# Crear directorio de configuración
mkdir -p /home/ncx/.config/rclone

# Ejecutar configuración interactiva
echo "Iniciando configuración..."
echo ""

# Configurar remote llamado 'gdrive'
~/bin/rclone config create gdrive drive \
  client_id "" \
  client_secret "" \
  token "" \
  config_auth_url "https://accounts.google.com/o/oauth2/auth" \
  config_token_url "https://oauth2.googleapis.com/token" \
  config_auth_style "2" \
  scope "drive" \
  2>&1

echo ""
echo "=== Configuración completada ==="
echo ""
echo "Para usar:"
echo "  ~/bin/rclone lsd gdrive:                    # Listar directorios"
echo "  ~/bin/rclone copy archivo.txt gdrive:Backup/  # Copiar archivo"
echo "  ~/bin/rclone sync /home/ncx/.clawcontroller/BACKUP_* gdrive:AI_Projects_Backup/  # Sincronizar backup"
