from flask import Flask, request, send_file
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
from dotenv import load_dotenv
import os

# Carregar variáveis do arquivo .env
load_dotenv()

app = Flask(__name__)

# Configurar a chave secreta a partir do .env
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

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

if __name__ == '__main__':
    app.run(debug=True)
