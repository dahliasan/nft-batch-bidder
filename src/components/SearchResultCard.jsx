import { useState, useEffect } from 'react'
import { API_KEYS } from '../utils/api'

function SearchResultCard(props) {
  const { collection, handleClick } = props

  const { address, name, imageUrl, totalSupply } = collection

  return (
    <div
      className="search-result--container"
      onClick={() => {
        handleClick(name, address)
      }}
    >
      <img className="search-result--logo" src={`${imageUrl}`} />

      <div className="search-result--name">{name}</div>
      <div className="search-result--total-supply">{totalSupply}</div>
    </div>
  )
}

export default SearchResultCard
