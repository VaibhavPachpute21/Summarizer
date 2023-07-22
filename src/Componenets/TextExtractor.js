import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OPENAI_API_KEY } from '../CONSTANTS';
import Speech from 'react-speech';

const TextExtractor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookLoading,setBookLoading]=useState(false)
  const [page, setPage] = useState(0);
  const [allPages, setAllPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [summaryOfWholeBook, setSummaryOfWholeBook] = useState('');
  const [summarizing, setSummarizing] = useState(false); // State to track summarization process
  const RATE_LIMIT_CHUNKS = 3;

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
    setBookLoading(true)
    axios.post('http://127.0.0.1:5000/get_text', formData)
      .then(response => {
        const allPrompts = response.data.text.map(chunk => ({
          role: "user",
          content: chunk
        }));
        setAllPages(allPrompts);
        setText(response.data.text);
        setTotalPages(allPrompts.length);
        setBookLoading(false)
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
        { role: "user", content: `Please give A concise yet comprehensive summary of the below book content, covering all the key points, characters, plot, and themes. The summary should be coherent, engaging, and written in a manner that even those who haven't read this book can understand the content and its significance.` },
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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  // sumarize book
  async function summarizeWholeBook() {
    setSummarizing(true);
    setLoading(true);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const systemMsg = {
      role: 'system',
      content: "You are a helpful assistant"
    };

    let summaryChunks = []; // To store the summary of each chunk
    let itaration = allPages.length > 3 ? 3 : allPages.length
    console.log(itaration)
    for (let i = 0; i < itaration; i++) {
      console.log(i)
      const data = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: "user", content: `pls summarize the following into bullet points` },
          allPages[i]
        ]
      };

      try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", data, { headers });
        const summary = response.data.choices[0].message.content;
        console.log(summary)
        summaryChunks.push(summary);
      } catch (error) {
        console.error(error);
        setSummarizing(false);
        setLoading(false);
        return;
      }
    }

    // Join all the summary chunks into the final summary of the whole book
    const finalSummary = summaryChunks.join(' ');
    try {
      const data = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: "user", content: `Following bullet point are summary of different pages of a book, summarise them all and give a conclusive paragraph about the book context of book and which can be called as summary of whole book. A concise yet comprehensive summary of the book, covering all the key points, characters, plot, and themes. The summary should be coherent, engaging, and written in a manner that even those who haven't read the book can understand the content and its significance.` },
          { role: "user", content: finalSummary }
        ]
      };
      const response = await axios.post("https://api.openai.com/v1/chat/completions", data, { headers });
      const summary = response.data.choices[0].message.content;
      console.log("final", summary)
      setSummary(summary)
    } catch (error) {
      console.error(error);
      setSummarizing(false);
      setLoading(false);
      return;
    }

    // Update state variables
    setSummaryOfWholeBook(finalSummary);

    setSummarizing(false);
    setLoading(false);
  }



  return (
    <div className='p-4'>
      <h2 className='text-center'>Book Summarizer</h2>
      <div className='container input-group'>
        <input className="form-control" type="file" onChange={handleFileChange} />
        <button className='input-group-text' onClick={handleFileUpload}>Upload File</button>
      </div>
      <div className='container p-2'>
        <div className='row'>
          <div className='col-md-6'>
           {bookLoading? <div className='text-center'><div className="spinner-border text-primary" role="status"></div> 
              <span className="visually-hidden">Loading...</span>
            </div>:<textarea className='form-control' value={text} style={{ width: '100%', minHeight: '500px' }} />}
          </div>
          <div className='col-md-6'>
            {loading ? <div className='text-center'><div className="spinner-border text-primary" role="status"></div> 
              <span className="visually-hidden">Loading...</span>
            </div>
              : <>
                <textarea className='form-control' value={summary} style={{ width: '100%', minHeight: '500px' }} />
                <div className='container pt-2'>
                  <div className='d-flex justify-content-between'>
                    <div>
                    <Speech
                      textAsButton={true}
                      displayText={<><i  className="fa fa-microphone fs-4"></i></>}
                      text={summary}
                    />
                    </div>
                    
                    <div>
                      <h6>Summarization of Page {page + 1} out of {totalPages}</h6>
                      <select
                        onChange={(e) => {
                          setPage(Number(e.target.value));
                        }}
                        value={page} >
                        {allPages.map((page, index) => (
                          <option key={index} value={index}>Page {index + 1}</option>
                        ))}
                      </select>
                    </div>
                    <button className='btn btn-primary mt-2' onClick={summarizeWholeBook} disabled={summarizing}>
                    Summarize Whole Book
                  </button>

                  </div>
                </div>

              </>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextExtractor;
