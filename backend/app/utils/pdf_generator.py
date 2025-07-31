import pdfkit
from io import BytesIO
from app.models.models import Rutina

def generate_rutina_pdf(rutina: Rutina):
    html_content = f"""
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            h1 {{ color: #333; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
        </style>
    </head>
    <body>
        <h1>Rutina: {rutina.nombre}</h1>
        <p><strong>Alumno:</strong> {rutina.alumno.nombre}</p>
        <p><strong>Fecha de inicio:</strong> {rutina.fecha_inicio.strftime('%d/%m/%Y') if rutina.fecha_inicio else 'No especificada'}</p>
        <p><strong>Entrenamientos por semana:</strong> {rutina.entrenamientos_semana}</p>
        <p><strong>Notas:</strong> {rutina.notas or 'Sin notas'}</p>
        
        <h2>Ejercicios</h2>
        <table>
            <tr>
                <th>Ejercicio</th>
                <th>Series</th>
                <th>Repeticiones</th>
                <th>Peso (kg)</th>
                <th>Descanso (seg)</th>
                <th>Notas</th>
            </tr>
    """
    
    for ejercicio in rutina.ejercicios:
        html_content += f"""
            <tr>
                <td>{ejercicio.ejercicio_base.nombre}</td>
                <td>{ejercicio.series}</td>
                <td>{ejercicio.repeticiones}</td>
                <td>{ejercicio.peso or '-'}</td>
                <td>{ejercicio.descanso}</td>
                <td>{ejercicio.notas or '-'}</td>
            </tr>
        """
    
    html_content += """
        </table>
    </body>
    </html>
    """
    
    options = {
        'page-size': 'A4',
        'margin-top': '0.75in',
        'margin-right': '0.75in',
        'margin-bottom': '0.75in',
        'margin-left': '0.75in',
        'encoding': "UTF-8",
        'no-outline': None
    }
    
    pdf = pdfkit.from_string(html_content, False, options=options)
    return pdf