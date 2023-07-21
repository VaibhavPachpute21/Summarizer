import React, { useState } from 'react';
import axios from 'axios';
import { OPENAI_API_KEY } from '../CONSTANTS';
import Speech from 'react-speech';

const TextExtractor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // For File Upload and get Text from python server
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
        setLoading(true)
        getGPTResponse(response.data.text)

      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
  };

  // For getting Summary from ChatGPT
  async function getGPTResponse(textToSummarize) {

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const systemMsg = {
      role: 'system',
      content: "You are a helpfull assitant"
    }

    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "user", content: `pls summarize the following into bullet points \n ${textToSummarize}` }
      ]
    };
    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", data, { headers });
      console.log(response.data.choices[0].message.content)
      setLoading(false)
      setSummary(response.data.choices[0].message.content)
    } catch (error) {
      console.error(error);
    }
  }


    

  

  return (
    <div className='p-4'>
      <div className='container input-group'>
        <input class="form-control" type="file" onChange={handleFileChange} />
        <button className='input-group-text' onClick={handleFileUpload}>Upload File</button>
      </div>
      <div className='container p-2'>
        <div className='row'>
          <div className='col-md-6'>
            <textarea className='form-control' value={text} style={{ width: '100%', minHeight: '500px' }} />
          </div>
          <div className='col-md-6'>
            {loading ? <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
              :<>
              <textarea className='form-control' value={summary} style={{ width: '100%', minHeight: '500px' }} />
              <Speech
              textAsButton={true}    
              displayText={<><i class="fa fa-microphone"></i></>} 
              text={summary} />
              </> }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextExtractor;
