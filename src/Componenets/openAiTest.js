import React, { useState } from 'react';
import 'dotenv/config'
const ChatForm = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requestOptions = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer OPENAITOKEN`
      },
      body: JSON.stringify({ prompt })
    };

    const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', requestOptions);
    const data = await response.json();
    console.log(data);
    setResponse(JSON.stringify(data));
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Enter a prompt:
        <input type="text" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
      </label>
      <button type="submit">Submit</button>

      {response && (
        <div>
          <h2>Response</h2>
          <pre>{response}</pre>
        </div>
      )}
    </form>
  );
};

export default ChatForm;