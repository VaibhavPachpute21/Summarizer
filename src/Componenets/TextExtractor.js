import React, { useState } from 'react';
import axios from 'axios';

const TextExtractor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://127.0.0.1:5000/get_text', formData)
      .then(response => {
        setText(response.data.text);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
  };

  return (
    <div >
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload File</button>
      <div>
        {text && (
          <div>
            <h3>Extracted Text:</h3>
            <p>{text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextExtractor;
