import React from 'react'
import { nanoid } from 'nanoid'
import SearchResultCard from './SearchResultCard.jsx'

export default function SearchBar(props) {
  const { query, handleChange, searchResults, handleClick, loading } = props

  return (
    <div className="search--container">
      <input
        type="text"
        id="search"
        value={query}
        onChange={handleChange}
        autoComplete="off"
        placeholder="search for a collection"
      />

      {loading && 'loading...'}

      <div className="search-results--container">
        {searchResults?.collections.map((collection) => {
          return (
            <SearchResultCard
              key={nanoid()}
              collection={collection}
              handleClick={handleClick}
            />
          )
        })}
      </div>
    </div>
  )
}
