from flask import Flask, request, jsonify
from PyPDF2 import PdfReader

app = Flask(__name__)

def extract_text_from_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            pdf_text = ''
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                pdf_text += page.extract_text().replace("\n", "")
            return pdf_text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ''

@app.route('/get_text', methods=['POST'])
def get_text():
    # Assuming the frontend sends a PDF file as a part of the POST request
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})

    pdf_file = request.files['file']

    if pdf_file.filename == '':
        return jsonify({'error': 'No selected file'})

    extracted_text = extract_text_from_pdf(pdf_file)
    return jsonify({'text': extracted_text})

if __name__ == '__main__':
    app.run(debug=True)
