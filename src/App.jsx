import { React, useState } from 'react'
import './styles/styles.css'
import SearchForm from './components/SearchForm'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CreateOffer from './pages/CreateOffer'
import { Routes, Route } from 'react-router-dom'

// create useAPI custom hook: https://scrimba.com/learn/reusablereact/a-promise-based-state-machine-c33KWyTy DONE

// debounce realtime search
// onclick save contract address to object state
// fetch assets from contract address
// save assets into data state

// save asset data into variable
// display assets
// display assets properties
// allow users to filter assets by properties

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nft-batch-bidder" element={<Home />} />
          <Route path="create-offer" element={<CreateOffer />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
