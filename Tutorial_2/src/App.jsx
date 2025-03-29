import { useState, useEffect } from 'react'
import { query } from './services/openai/query.jsx';
import { RetrieveRooms } from './services/firebase/rooms/RetrieveRooms.js';
import './App.css'

function App() {
  const [dialogues, setDialogues] = useState([]);
  const [allRooms, setAllRooms] = useState({});

  const [API_KEY, SET_API_KEY] = useState(localStorage.getItem("API_KEY"));
  const setNewApiKeyHandler = (newKey) => {
    localStorage.setItem('API_KEY', newKey);
    SET_API_KEY(newKey);
  }

  useEffect(() => {
    RetrieveRooms(setAllRooms);
  },[]); 

  return (
    <div className="App">
      <header className="App-header">
        <h4>ID KAIST Space Management Chatbot</h4>
        <div className="apiKey">
          <label onClick={() => {
            let newKey = prompt("Your Current Key is "+API_KEY+'\n\nEnter your new API key here');  
            if (newKey !== null) {
              setNewApiKeyHandler(newKey);
              // SET_API_KEY(newKey);
            }
          }}>API</label>
        </div>
      </header>
      <div className="App-body">
        <div className="Dialogues">
          {dialogues.map((dialogue, index) => (
            <div key={index} className="Dialogue">
              <div className="UserDialogue">
                <div className="UserMessage">
                  {dialogue.user}
                </div>
              </div>
              <div className="BotDialogue">
                <div className="BotMessage">
                  {dialogue.bot}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bottomUI">
          <textarea className="UserInput" placeholder="Type your message here..."></textarea>
          <button className="SendButton" onClick={
            ()=>{
              let input = document.querySelector('.UserInput').value;
              if (API_KEY === null) {
                alert("Please enter your API Key first");
                return;
              }
              if (input === "") {
                alert("Please enter your message first");
                return;
              }
              setDialogues([...dialogues, { user: input, bot: "Loading..." }]);
              query({ apiKey: API_KEY, input, dialogues, allRooms, setResponse: (response)=> {
                setDialogues([...dialogues, { user: input, bot: response }]);
              }})
            }
          }>Send</button>
        </div>
      </div>
    </div>
  )
}

export default App
