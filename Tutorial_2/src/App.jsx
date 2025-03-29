import { useState, useEffect } from 'react'
import './App.css'
import { CiSettings } from "react-icons/ci";
import { RetrieveRooms } from './services/firebase/rooms/RetrieveRooms.js';
import { query } from './services/openai/query.jsx';

function App() {
  const [API_KEY, SET_API_KEY] = useState(localStorage.getItem("API_KEY"));
  const setNewApiKeyHandler = (newKey) => {
    localStorage.setItem("API_KEY", newKey);
    SET_API_KEY(newKey);
  }
  const [dialogues, setDialogues] = useState([]);
  const [allRooms, setAllRooms] = useState({});
  
  useEffect(() => {
    RetrieveRooms(setAllRooms);
  },[]); 

  // useEffect(() => {
  //   const input = "자기 소개 부탁해";
  //   query({
  //     apiKey: API_KEY, input, dialogues, setLoading: () => { }, setResponse: (response) => {
  //       setDialogues([...dialogues, { user: input, bot: response }]);
  //     }
  //   });
  // }, []);
  return (
    <div className="App">
      <header className="App-header">
        <h4>ID KAIST Space Management Chatbot</h4>
        <div className="apiKey">
          <label onClick={() => {
            let newKey = prompt(`Your Current Key: ${API_KEY} \n\nEnter your new API key here`);
            if (newKey !== null) setNewApiKeyHandler(newKey);
          }}><CiSettings /></label>
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
          <button className="SendButton" onClick={() => {
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
            query({
              apiKey: API_KEY, input, dialogues, allRooms, setLoading: () => { }, setResponse: (response) => {
                setDialogues([...dialogues, { user: input, bot: response }]);
              }
            });
          }}>SEND</button>
        </div>
      </div>
    </div>
  )
}

export default App
