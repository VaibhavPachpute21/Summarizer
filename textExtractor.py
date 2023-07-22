from PyPDF2 import PdfReader
from summertime import model


def extract_text_from_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            pdf_text = ''
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                pdf_text += page.extract_text().replace("\n","")
            return pdf_text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ''

if __name__ == '__main__':
    pdf_file_path = 'D:\Web\\react\healthify\Rich Dad Poor Dad.pdf'
    extracted_text = extract_text_from_pdf(pdf_file_path)
    print(extracted_text)
    api_key = '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'

