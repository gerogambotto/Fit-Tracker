import os
import requests
from datetime import datetime
from dotenv import load_dotenv
import html

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@fittracker.com")

def send_payment_reminder(alumno_email: str, alumno_nombre: str, coach_nombre: str):
    """Enviar recordatorio de pago usando Resend"""
    if not RESEND_API_KEY:
        print("RESEND_API_KEY no configurado")
        return False
    
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "from": FROM_EMAIL,
        "to": [alumno_email],
        "subject": "Recordatorio de Pago - FitTracker",
        "html": f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Recordatorio de Pago</h2>
                
                <p>Hola <strong>{html.escape(alumno_nombre)}</strong>,</p>
                
                <p>Este es un recordatorio amigable de que tu mensualidad de entrenamiento está próxima a vencer.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Coach:</strong> {html.escape(coach_nombre)}</p>
                    <p><strong>Fecha de vencimiento:</strong> {datetime.now().strftime('%d/%m/%Y')}</p>
                </div>
                
                <p>Por favor, ponte en contacto con tu coach para coordinar el pago.</p>
                
                <p>¡Gracias por confiar en nosotros para tu entrenamiento!</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #6b7280;">
                    Este es un mensaje automático de FitTracker. Si no deseas recibir estos recordatorios, 
                    contacta a tu coach para desactivar las notificaciones.
                </p>
            </div>
        </body>
        </html>
        """
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            print(f"Email enviado exitosamente a {alumno_email}")
            return True
        else:
            print(f"Error enviando email: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Error enviando email: {str(e)}")
        return False