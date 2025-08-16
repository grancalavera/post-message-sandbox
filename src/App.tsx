import './App.css'

function App() {
  return (
    <div className="container">
      <h1>Post Message Sandbox</h1>
      <p>Experiments with browser APIs that use postMessage, integrated with Comlink.</p>
      
      <div className="experiments">
        <h2>Experiments</h2>
        <ul className="experiment-list">
          <li>
            <a href="/experiment-01/" className="experiment-link">
              <strong>Experiment 01: MessageChannel</strong>
              <span>Communication between windows using MessageChannel API through Comlink</span>
            </a>
          </li>
          <li>
            <a href="/experiment-02/" className="experiment-link">
              <strong>Experiment 02: SharedWorker-brokered MessageChannel</strong>
              <span>SharedWorker as neutral broker to transfer MessagePort between windows</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default App
