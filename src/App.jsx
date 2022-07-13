import { React, useEffect } from 'react'
import './styles/styles.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CreateOffer from './pages/CreateOffer'
import { Routes, Route } from 'react-router-dom'
import { useMoralis } from 'react-moralis'

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route exact path="/nft-batch-bidder" element={<Home />} />
          <Route
            exact
            path="/nft-batch-bidder/create-offer"
            element={<CreateOffer />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
