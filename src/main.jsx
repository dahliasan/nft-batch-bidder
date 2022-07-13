import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/styles.css'
import { BrowserRouter } from 'react-router-dom'
import { MoralisProvider } from 'react-moralis'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MoralisProvider
      appId="lhGFpFEG9KosBhWxAmcFZ2nzbShcuLc3XH7ztamA"
      serverUrl="https://mur6opd9oo91.usemoralis.com:2053/server"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>
)
