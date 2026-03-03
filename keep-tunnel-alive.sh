#!/bin/bash
# Mantener localtunnel activo para ClawController

while true; do
    echo "Iniciando localtunnel en puerto 18789..."
    lt --port 18789 2>&1 | tee /tmp/loca.lt.log
    
    # Si el túnel se cae, esperar 5 segundos y reconectar
    echo "Túnel caído, reiniciando en 5 segundos..."
    sleep 5
done
