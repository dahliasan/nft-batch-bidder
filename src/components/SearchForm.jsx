import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import SearchBar from './SearchBar.jsx'
import useCollectionSearch from '../hooks/useCollectionSearch.js'
import { resolveUrl, shortenString } from '../utils/helperFunctions.jsx'
// import Select from 'react-select'
import { createTraitOptions } from '../utils/filteringHelpers'
import CollectionInfoHeader from './CollectionInfoHeader.jsx'

function SearchForm(props) {
  const [query, setQuery] = useState('')
  const [selectedCollection, setSelectedCollection] = useState({
    name: '',
    address: '',
  })
  const [pageNumber, setPageNumber] = useState(1)
  const [selectedTraits, setSelectedTraits] = useState([])
  const { loading, error, hasMore, data } = useCollectionSearch(
    query,
    selectedCollection,
    pageNumber,
    selectedTraits
  )

  const { collectionSearch, collectionNfts, collectionTraits } = data || {}

  const traitOptions = useMemo(() => {
    return createTraitOptions(collectionTraits)
  }, [collectionTraits])

  useEffect(() => {
    setSelectedTraits([])
  }, [selectedCollection])

  useEffect(() => {
    if (selectedTraits.length === 0) setPageNumber(1)
  }, [selectedTraits])

  // handle infinite scroll to load more nfts
  const observer = useRef()
  const lastNftElementRef = useCallback(
    (node) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log('visible')
          setPageNumber((prevPageNumber) => prevPageNumber + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  function handleSearch(e) {
    setQuery(e.target.value)
    setPageNumber(1)
  }

  function handleSearchClick(name, contractAddress) {
    console.log(`--- collection ${name} ${contractAddress} is selected!`)
    setSelectedCollection({ name: name, address: contractAddress })
    setQuery('')
  }

  function renderCollectionInfo() {
    try {
      const { contract, total } = collectionNfts

      return (
        <CollectionInfoHeader
          image={contract.metadata.thumbnail_url}
          name={contract.name}
          totalSupply={total}
          selectedTraits={selectedTraits}
          traitOptions={traitOptions}
          handleChange={setSelectedTraits}
        />
      )
    } catch (error) {
      console.log(error)
    }
  }

  function renderNfts() {
    try {
      console.log('--- rendering nfts...', collectionNfts)
      const { nfts } = collectionNfts || {}

      // get nft html
      const nftsHtml = nfts.map((item, index) => {
        const { token_id, metadata } = item || {}
        const { name, attributes, image } = metadata || {}
        const isLastElement = nfts.length === index + 1

        const attributesHtml = attributes?.map((item, index) => {
          let { trait_type, value } = item || {}

          value = shortenString(value)

          return (
            <div key={`${index}`} className="nft-card--trait">
              <div>{trait_type}</div>
              <div className="trait--value">{value}</div>
            </div>
          )
        })

        return (
          <div
            key={token_id}
            ref={isLastElement ? lastNftElementRef : null}
            className="nft-card--container"
          >
            <div className="overflow-wrapper">
              <div className="nft-card--image-container">
                <div className="nft-card--image">{resolveUrl(image)}</div>
                <div className="nft-card--tokenId">{'#' + token_id}</div>
                <div className="nft-card--image-overlay">{attributesHtml}</div>
              </div>
            </div>

            <div className="nft-card--name">{name ? name : `#${token_id}`}</div>
          </div>
        )
      })

      return (
        <>
          {!loading && (
            <div className="collection-nfts--container">{nftsHtml}</div>
          )}

          <div>{loading && 'Loading...'}</div>
        </>
      )
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <SearchBar
        query={query}
        handleChange={handleSearch}
        searchResults={collectionSearch}
        handleClick={handleSearchClick}
        loading={loading}
      />
      <div className="collection--container">
        {collectionNfts?.contract && renderCollectionInfo()}
        {loading && 'loading...'}
        {error}
        {collectionNfts?.nfts && renderNfts()}
      </div>
    </div>
  )
}

export default SearchForm
