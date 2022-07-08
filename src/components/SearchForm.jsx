import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import SearchBar from './SearchBar.jsx'
import useCollectionSearch from '../hooks/useCollectionSearch.js'
import { resolveUrl, shortenString } from '../utils/helperFunctions.jsx'
import { createTraitOptions } from '../utils/filteringHelpers'
import CollectionInfoHeader from './CollectionInfoHeader.jsx'
import { nanoid } from 'nanoid'

function SearchForm(props) {
  const [query, setQuery] = useState('')
  const [selectedCollection, setSelectedCollection] = useState({
    name: '',
    address: '',
  })
  const [pageNumber, setPageNumber] = useState(1)
  const [selectedTraits, setSelectedTraits] = useState(null)
  const { loading, error, hasMore, data } = useCollectionSearch(
    query,
    selectedCollection,
    pageNumber,
    selectedTraits
  )

  const {
    collectionSearch,
    collectionNfts,
    collectionTraits,
    collectionInfo,
    collectionNftStats,
  } = data || {}

  const traitOptions = useMemo(() => {
    return createTraitOptions(collectionTraits)
  }, [collectionTraits])

  useEffect(() => {
    setSelectedTraits(null)
  }, [selectedCollection])

  // useEffect(() => {
  //   if (selectedTraits.length === 0) setPageNumber(1)
  // }, [selectedTraits])

  // handle infinite scroll to load more nfts
  const observer = useRef()
  const lastNftElementRef = useCallback(
    (node) => {
      console.log('useCallback is triggered', observer)
      if (loading.nfts) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log('visible')
          setPageNumber((prevPageNumber) => prevPageNumber + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading.nfts, hasMore]
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
      const { info } = collectionInfo

      return (
        <CollectionInfoHeader
          image={info.imageUrl}
          name={info.name}
          totalSupply={info.statistics.totalSupply}
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
      const nfts = collectionNfts
      const { totalCountLeft, count } = collectionNftStats || {}
      console.log(totalCountLeft, count)
      const totalCount = totalCountLeft + count

      // get nft html
      const nftsHtml = nfts.map((item, index) => {
        const { token_id, metadata } = item || {}
        const { name, attributes, image } = metadata || {}
        const isLastElement = nfts.length === index + 1

        const attributesHtml = attributes?.map((item, index) => {
          let { trait_type, value } = item || {}

          value = shortenString(value)

          return (
            <div key={nanoid()} className="nft-card--trait">
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
          {/* {!error && totalCount + ' items'} */}
          {!loading.nfts && !error && (
            <div className="collection-nfts--container">{nftsHtml}</div>
          )}
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
        loading={loading.search}
      />
      <div className="collection--container">
        {collectionInfo && renderCollectionInfo()}
        {loading.nfts && 'loading...'}
        {error}
        {collectionNfts && renderNfts()}
      </div>
    </div>
  )
}

export default SearchForm
