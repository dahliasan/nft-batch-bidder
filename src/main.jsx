import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/styles.css'
import { BrowserRouter } from 'react-router-dom'
import { MoralisProvider } from 'react-moralis'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MoralisProvider
      appId={import.meta.env.VITE_APP_ID}
      serverUrl={import.meta.env.VITE_SERVER_URI}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>
)
