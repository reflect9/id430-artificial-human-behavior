import { useState, useEffect } from 'react'
import { query } from './openai/query'
import './App.css'

function App() {
  const [temperature, setTemperature] = useState(22);
  const [humidity, setHumidity] = useState(45);
  const [targetTemperature, setTargetTemperature] = useState(22);
  const [status, setStatus] = useState('Idle');
  
  const [personDescription, setPersonDescription] = useState('You are an ordinary person who likes to stay in a hot room (at 27degree in celsius).');
  const [response, setResponse] = useState([]);

  const getCurrentInfo = () => { 
    return `
Temperature: ${temperature} 
Humidity: ${humidity}
Status: ${status}
Target Temperature: ${targetTemperature} 
`;
}
  const increaseTemperature = () => {
    setTargetTemperature(prevTemp => prevTemp + 1);
    setStatus('Heating');
  }
  const decreaseTemperature = () => {
    setTargetTemperature(prevTemp => prevTemp - 1);
    setStatus('Cooling');
  }

  const handleResponse = (data) => {
    if (data.controlAction === 'up') {
      increaseTemperature();
    } else if (data.controlAction === 'down') {
      decreaseTemperature();
    }
    // Append the userEmotion to the response
    setResponse(prevResponse => (
      ["\n" + data.userEmotion + " (" + data.controlAction + ")", ...prevResponse]
    ));
  }

  const letLLMThink = () => {
    const currentInfo = getCurrentInfo();
    const prompt = `Assume that you are the following person: 
        ${personDescription}
    
    Given the following information, please provide a response: 
        ${currentInfo}`;
    console.log(prompt);
    query({ input: prompt, handleResponse: handleResponse });
  }

  useEffect(() => {
    if (targetTemperature > temperature) {
      setStatus('Heating');
    } else if (targetTemperature < temperature) {
      setStatus('Cooling');
    } else {
      setStatus('Idle');
    }
  }, [targetTemperature, temperature] );

  useEffect(() => {
    // Simulate an API call to get the current temperature and humidity
    // by calling letLLMThink function
    const interval = setInterval(() => {
      // Simulate getting new temperature and humidity values
      setTemperature(prevTemp => prevTemp + Math.floor(Math.random() * 3) - 1);
      setHumidity(prevHumidity => prevHumidity + Math.floor(Math.random() * 3) - 1);
      letLLMThink();
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="App">
      <div className="llm">
        <h1>User Agent</h1>
        <textarea className="prompt" 
        onChange={(e) => {setPersonDescription(e.target.value);}}
        placeholder="Type your agent's description here...">
          {personDescription}
        </textarea>
        <button className="save-button">SAVE PROMPT</button>
        <div className="response">
          {response.map((res)=>{
            return (
              <div className="response-item" key={res}>
                {res}
              </div>
            )
          })}
        </div>
      </div>
      <div className="thermostat">
        <h1>Thermostat</h1>
        <div className="thermostat-display">
          <p>Current Temperature: {temperature}°C</p>
          <p>Humidity: {humidity}%</p>
          <p>Status: {status}</p>
          <p><em>Target Temperature: {targetTemperature}°C</em></p>
        </div>
        <div className="thermostat-controls">
          <button onClick={()=>{increaseTemperature();}}>Increase Temperature</button>
          <button onClick={()=>{decreaseTemperature();}}>Decrease Temperature</button>
        </div>
      </div>

    </div>
  )
}

export default App
