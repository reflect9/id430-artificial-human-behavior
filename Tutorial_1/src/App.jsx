import { useState } from 'react'
import './App.css'

import OpenAI from "openai";

function App() {
  // State variables to store system prompt, user prompt, and response
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);

  // Setting up an OpenAI API client
  const client = new OpenAI({ apiKey: "API_KEY_HERE",
    dangerouslyAllowBrowser: true
  });

  // Method to handle the submit button click
  const handleSubmit = async () => {
    // Reading system and user prompts from the textareas
    const systemPrompt = document.getElementById('systemPrompt').value;
    const userPrompt = document.getElementById('userPrompt').value;

    // "async" and "await" are used for handling asynchronous operations 
    // that takes time to complete
    setIsWaiting(true);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }); // it will wait until it gets the response from the API
    // Updating the response variable so that the response is displayed on the webpage
    setResponse(completion.choices[0].message.content); 
    setIsWaiting(false);
  }

  // Rendering the webpage
  return (
    <div className="App">
      <div className="Header">
        <h1>Prompt Engineering Tutorial</h1>
      </div>
      <div className="Content">
        <div className="Section SystemPrompt">
          <label>System Prompt</label>
          <textarea id="systemPrompt" rows="4" cols="50" onChange={(e)=>{
            let newSystemPrompt = e.target.value; 
            console.log(newSystemPrompt);
            setSystemPrompt(newSystemPrompt);
          }} value={systemPrompt}></textarea>
        </div>
        <div className="Section UserPrompt">
          <label>User Prompt</label>
          <textarea id="userPrompt" rows="4" cols="50" onChange={(e)=>{
            let newUserPrompt = e.target.value;
            console.log(newUserPrompt);
            setUserPrompt(newUserPrompt);
          }} value={userPrompt}></textarea>
        </div>
        <div className="Section Button">
          <center>
            <button id="submit" onClick={(e)=>{handleSubmit(e.target.value);}}>Submit</button>
          </center>
        </div>
        <hr/>
        <div className="Section Response">
          <label>Response</label>
          <p>{isWaiting && 'Waiting for the response...'}</p>
          <p id="response">{!isWaiting && response}</p>
        </div>
      </div>
      
    </div>
  )
}

export default App
