from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

def extract_text_from_pdf(pdf_file):
    try:
        pdf_reader = PdfReader(pdf_file)
        pdf_text = ''
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            pdf_text += page.extract_text().replace("\n", "")
        words = pdf_text.split()
        chunks = [' '.join(words[i:i+2000]) + '\n---------------------------\n' for i in range(0, len(words), 2000)]
        return chunks
        # truncated_text = ' '.join(words[:4000])
        # return [truncated_text]
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ''

@app.route('/get_text', methods=['POST'])
def get_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})

    pdf_file = request.files['file']

    if pdf_file.filename == '':
        return jsonify({'error': 'No selected file'})

    extracted_text = extract_text_from_pdf(pdf_file)

    return jsonify({'text': extracted_text})

if __name__ == '__main__':
    app.run(debug=True)
