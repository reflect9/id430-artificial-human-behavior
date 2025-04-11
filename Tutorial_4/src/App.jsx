import { useState } from 'react'
import { grok } from './grok' // Import the function for calling Grok API
import { claude } from './claude' // Import the function for calling Claude API
import { chatgpt } from './chatgpt' // Import the function for calling ChatGPT API
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [responseGrok, setResponseGrok] = useState('')
  const [responseClaude, setResponseClaude] = useState('')
  const [responseChatGPT, setResponseChatGPT] = useState('')

  const callLLMs = async () => {
    setResponseGrok(await grok(prompt));
    setResponseClaude(await claude(prompt));
    setResponseChatGPT(await chatgpt(prompt));
  }
  return (
    <div className="App">
      <h2>Tutorial 4: Model Comparison</h2>      
      <textarea className="prompt" onChange={(e)=>{
        setPrompt(e.target.value);  // update the state variable "prompt" 
      }}>{prompt}</textarea>
      <button className="submitButton" onClick={()=>{callLLMs();}}>SUBMIT</button>
      <h4>Responses:</h4>
      <div className="responses">
        <div className="response">
          <h4>Grok:</h4>
          <p>{responseGrok}</p>
        </div>
        <div className="response">
          <h4>Claude:</h4>
          <p>{responseClaude}</p>
        </div>
        <div className="response">
          <h4>ChatGPT:</h4>
          <p>{responseChatGPT}</p>
        </div>
      </div>
    </div>
  )
}

export default App




