from PyPDF2 import PdfReader
import requests
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from heapq import nlargest

def extract_text_from_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            pdf_text = ''
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                pdf_text += page.extract_text().replace("\n","")
                words=pdf_text.split(" ")
                words=words[:400]

            return ' '.join(words)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ''

def generate_summary(text, api_key):
    print("text")
    print(text)
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    data = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": text}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        summary = response.json()["choices"][0]["message"]["content"].strip()
        return summary
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        return ''
    except Exception as e:
        print(f"Error occurred: {e}")
        return ''


if __name__ == '__main__':
    pdf_file_path = 'D:\Web\\react\healthify\Termux training book learn professionaly.pdf'
    extracted_text = extract_text_from_pdf(pdf_file_path)
    api_key = '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'
    summary = generate_summary(extracted_text, api_key)
    print('\n-------Summary-----')
    print(summary)
