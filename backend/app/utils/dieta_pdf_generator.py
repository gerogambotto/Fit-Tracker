from io import BytesIO
from app.models.models import Dieta

def generate_dieta_pdf(dieta: Dieta):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from io import BytesIO
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    y = 750
    p.drawString(100, y, f"Dieta: {dieta.nombre or 'Sin nombre'}")
    y -= 30
    p.drawString(100, y, f"Alumno: {dieta.alumno.nombre if dieta.alumno else 'Sin asignar'}")
    y -= 20
    p.drawString(100, y, f"Fecha inicio: {dieta.fecha_inicio.strftime('%d/%m/%Y') if dieta.fecha_inicio else 'No especificada'}")
    y -= 20
    p.drawString(100, y, f"Notas: {dieta.notas or 'Sin notas'}")
    y -= 40
    
    p.drawString(100, y, "Comidas:")
    y -= 20
    
    # Mostrar comidas de forma simple
    if hasattr(dieta, 'comidas') and dieta.comidas:
        for comida in dieta.comidas:
            if y < 100:
                p.showPage()
                y = 750
            
            p.drawString(120, y, f"- {comida.nombre or 'Sin nombre'} (Día {comida.dia or 1})")
            y -= 15
            
            if hasattr(comida, 'alimentos') and comida.alimentos:
                for ca in comida.alimentos:
                    if y < 80:
                        p.showPage()
                        y = 750
                    alimento_nombre = ca.alimento.nombre if ca.alimento else 'Alimento desconocido'
                    p.drawString(140, y, f"  • {alimento_nombre}: {ca.cantidad_gramos or 0}g")
                    y -= 12
            y -= 5
    else:
        p.drawString(120, y, "No hay comidas registradas")
    
    p.save()
    buffer.seek(0)
    return buffer.getvalue()