import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OPENAI_API_KEY } from '../CONSTANTS';
import Speech from 'react-speech';

const TextExtractor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [allPages, setAllPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (allPages.length > 0) {
      getGPTResponse(page);
    }
  }, [page]);

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
        const allPrompts = response.data.text.map(chunk => ({
          role: "user",
          content: chunk
        }));
        setAllPages(allPrompts);
        setText(response.data.text);
        setTotalPages(allPrompts.length);
        setPage(1); // Set the page to the first page initially
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
  };

  // For getting Summary from ChatGPT
  async function getGPTResponse(pageIndex) {
    setLoading(true);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const systemMsg = {
      role: 'system',
      content: "You are a helpful assistant"
    };

    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "user", content: `pls summarize the following into short` },
        allPages[pageIndex]
      ]
    };
    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", data, { headers });
      setLoading(false);
      setSummary(response.data.choices[0].message.content);
      setPage(pageIndex);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className='p-4'>
      <div className='container input-group'>
        <input className="form-control" type="file" onChange={handleFileChange} />
        <button className='input-group-text' onClick={handleFileUpload}>Upload File</button>
      </div>
      <div className='container p-2'>
        <div className='row'>
          <div className='col-md-6'>
            <textarea className='form-control' value={text} style={{ width: '100%', minHeight: '500px' }} />
          </div>
          <div className='col-md-6'>
            {loading ? <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
              :<>
              <h5>Summarization of Page {page + 1} out of {totalPages}</h5>
              <select 
                onChange={(e) => {
                  setPage(Number(e.target.value));
                }}
                value={page}
              >
                {allPages.map((page, index) => (
                  <option key={index} value={index}>Page {index + 1}</option>
                ))}
              </select>
              <textarea className='form-control' value={summary} style={{ width: '100%', minHeight: '500px' }} />
              <Speech
                textAsButton={true}    
                displayText={<><i className="fa fa-microphone"></i></>} 
                text={summary}
              />
              </> }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextExtractor;
