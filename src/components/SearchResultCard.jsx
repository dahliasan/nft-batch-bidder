import { useState, useEffect } from 'react'
import { API_KEYS } from '../utils/api'

function SearchResultCard(props) {
  const { data, handleClick } = props

  return (
    <div
      className="search-result--container"
      onClick={() => {
        handleClick(data)
      }}
    >
      <img
        className="search-result--logo"
        src={`${data.logo}?apiKey=${API_KEYS.ubiquity}`}
      />

      <div className="search-result--name">{data.name}</div>
    </div>
  )
}

export default SearchResultCard
