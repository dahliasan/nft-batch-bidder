import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/nft-batch-bidder" className="site-title">
        Home
      </Link>
      <ul>
        <li>
          <Link to="/nft-batch-bidder/create-offer" className="site-link">
            Manual Offer
          </Link>
        </li>
      </ul>
    </nav>
  )
}
