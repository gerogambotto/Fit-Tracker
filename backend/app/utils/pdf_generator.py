from io import BytesIO
from app.models.models import Rutina

def generate_rutina_pdf(rutina: Rutina):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from io import BytesIO
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    y = 750
    p.drawString(100, y, f"Rutina: {rutina.nombre}")
    y -= 30
    p.drawString(100, y, f"Alumno: {rutina.alumno.nombre if rutina.alumno else 'Sin asignar'}")
    y -= 20
    p.drawString(100, y, f"Entrenamientos/semana: {rutina.entrenamientos_semana}")
    y -= 40
    
    # Organizar ejercicios por día
    dias_ejercicios = {}
    for ejercicio in rutina.ejercicios:
        dia = ejercicio.dia
        if dia not in dias_ejercicios:
            dias_ejercicios[dia] = []
        dias_ejercicios[dia].append(ejercicio)
    
    # Mostrar ejercicios por día
    for dia in sorted(dias_ejercicios.keys()):
        if y < 150:
            p.showPage()
            y = 750
        
        p.drawString(100, y, f"Día {dia}")
        y -= 20
        
        for ejercicio in dias_ejercicios[dia]:
            if y < 100:
                p.showPage()
                y = 750
            
            peso_text = f" × {ejercicio.peso}kg" if ejercicio.peso else ""
            p.drawString(120, y, f"{ejercicio.ejercicio_base.nombre}")
            y -= 15
            p.drawString(140, y, f"{ejercicio.series} series × {ejercicio.repeticiones} reps{peso_text} - Descanso: {ejercicio.descanso}s")
            y -= 15
            
            if ejercicio.notas:
                p.drawString(140, y, f"{ejercicio.notas}")
                y -= 15
            
            y -= 5  # Espacio entre ejercicios
        
        y -= 15  # Espacio entre días
    
    p.save()
    buffer.seek(0)
    return buffer.getvalue()