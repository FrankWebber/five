from flask import Flask, request, send_file, render_template, jsonify
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
from dotenv import load_dotenv
import os
from datetime import datetime
import json

# Carregar variáveis do arquivo .env
load_dotenv()

app = Flask(__name__)

# Configurar a chave secreta a partir do .env
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Rota para servir o index.html
@app.route('/')
def index():
    return render_template('index.html')

# Rota para gerar PDFs
@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    data = request.json
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    text = data.get('text', 'No data provided')

    c.drawString(100, 750, text)
    c.save()

    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='report.pdf', mimetype='application/pdf')

# Rota para calcular quinquênios
@app.route('/calculate-quinquennium', methods=['POST'])
def calculate_quinquennium():
    data = request.json
    start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
    end_date = datetime.strptime(data['endDate'], '%Y-%m-%d')
    interruptions = data.get('interruptions', [])

    quinquenniums = []
    current_start = start_date
    adjusted_end_date = end_date

    while current_start < adjusted_end_date:
        quinquennium_end = current_start.replace(year=current_start.year + 5)

        total_interruption_days = 0
        for interruption in interruptions:
            interruption_start = datetime.strptime(interruption['start'], '%Y-%m-%d')
            interruption_end = datetime.strptime(interruption['end'], '%Y-%m-%d')

            if interruption_start < quinquennium_end and interruption_end > current_start:
                start = max(current_start, interruption_start)
                end = min(quinquennium_end, interruption_end)
                total_interruption_days += (end - start).days

        quinquennium_end += timedelta(days=total_interruption_days)

        if quinquennium_end > adjusted_end_date:
            quinquennium_end = adjusted_end_date

        quinquenniums.append({
            'start': current_start.strftime('%d/%m/%Y'),
            'end': quinquennium_end.strftime('%d/%m/%Y')
        })

        current_start = quinquennium_end

    return jsonify(quinquenniums)

if __name__ == '__main__':
    app.run(debug=True)
