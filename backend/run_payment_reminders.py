#!/usr/bin/env python3
"""
Script para ejecutar recordatorios de pago.
Ejecutar diariamente con cron job o tarea programada.

Ejemplo cron job (ejecutar todos los días a las 9:00 AM):
0 9 * * * cd /path/to/fittracker/backend && python run_payment_reminders.py
"""

import sys
import os
import logging
from datetime import datetime

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.tasks.payment_reminders import check_payment_reminders

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('payment_reminders.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Iniciando verificación de recordatorios de pago...")
    try:
        check_payment_reminders()
        logger.info("Verificación completada exitosamente.")
    except Exception as e:
        logger.error(f"Error durante la verificación: {str(e)}")
        sys.exit(1)