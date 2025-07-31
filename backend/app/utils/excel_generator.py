from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from io import BytesIO
from app.models.models import Rutina

def generate_rutina_excel(rutina: Rutina):
    wb = Workbook()
    ws = wb.active
    ws.title = "Rutina"
    
    # Estilos
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    
    # Información de la rutina
    ws['A1'] = "Rutina:"
    ws['B1'] = rutina.nombre
    ws['A2'] = "Alumno:"
    ws['B2'] = rutina.alumno.nombre
    ws['A3'] = "Fecha de inicio:"
    ws['B3'] = rutina.fecha_inicio.strftime('%d/%m/%Y') if rutina.fecha_inicio else 'No especificada'
    ws['A4'] = "Entrenamientos/semana:"
    ws['B4'] = rutina.entrenamientos_semana
    ws['A5'] = "Notas:"
    ws['B5'] = rutina.notas or 'Sin notas'
    
    # Headers de ejercicios
    ws['A7'] = "Ejercicio"
    ws['B7'] = "Series"
    ws['C7'] = "Repeticiones"
    ws['D7'] = "Peso (kg)"
    ws['E7'] = "Descanso (seg)"
    ws['F7'] = "Notas"
    
    # Aplicar estilos a headers
    for cell in ['A7', 'B7', 'C7', 'D7', 'E7', 'F7']:
        ws[cell].font = header_font
        ws[cell].fill = header_fill
    
    # Datos de ejercicios
    row = 8
    for ejercicio in rutina.ejercicios:
        ws[f'A{row}'] = ejercicio.ejercicio_base.nombre
        ws[f'B{row}'] = ejercicio.series
        ws[f'C{row}'] = ejercicio.repeticiones
        ws[f'D{row}'] = ejercicio.peso or '-'
        ws[f'E{row}'] = ejercicio.descanso
        ws[f'F{row}'] = ejercicio.notas or '-'
        row += 1
    
    # Ajustar ancho de columnas
    ws.column_dimensions['A'].width = 20
    ws.column_dimensions['B'].width = 10
    ws.column_dimensions['C'].width = 15
    ws.column_dimensions['D'].width = 12
    ws.column_dimensions['E'].width = 15
    ws.column_dimensions['F'].width = 20
    
    # Guardar en BytesIO
    excel_buffer = BytesIO()
    wb.save(excel_buffer)
    excel_buffer.seek(0)
    
    return excel_buffer.getvalue()