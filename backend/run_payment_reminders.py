#!/usr/bin/env python3
"""
Script para ejecutar recordatorios de pago.
Ejecutar diariamente con cron job o tarea programada.

Ejemplo cron job (ejecutar todos los días a las 9:00 AM):
0 9 * * * cd /path/to/fittracker/backend && python run_payment_reminders.py
"""

import sys
import os

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.tasks.payment_reminders import check_payment_reminders

if __name__ == "__main__":
    print("Iniciando verificación de recordatorios de pago...")
    check_payment_reminders()
    print("Verificación completada.")