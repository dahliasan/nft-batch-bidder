import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import SearchResultCard from './SearchResultCard.jsx'
import useCollectionSearch from '../hooks/useCollectionSearch.js'
import { renderFile, shortenAddress } from '../utils/helperFunctions.jsx'
import Select from 'react-select'

function SearchForm(props) {
  const [query, setQuery] = useState('')
  const [selectedContractAddress, setSelectedContractAddress] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [selectedTraits, setSelectedTraits] = useState(null)
  const { loading, error, hasMore, data } = useCollectionSearch(
    query,
    selectedContractAddress,
    pageNumber,
    selectedTraits
  )

  const { collections, collectionNfts, collectionMetadata } = data || {}

  const filterOptions = useMemo(() => {
    return createFilterOptions()
  }, [collectionMetadata])

  useEffect(() => {
    setSelectedTraits(null)
  }, [selectedContractAddress])

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

  function createFilterOptions() {
    if (!collectionMetadata) return
    const { traits } = collectionMetadata
    const filterOptions = Object.entries(traits).map((item) => {
      let [label, options] = item

      let optionsArray = []
      for (const key in options) {
        let obj = {
          label: key,
          value: `${label}:${key}`,
          count: options[key],
        }
        optionsArray.push(obj)
      }

      return {
        label: label,
        options: optionsArray,
      }
    })
    return filterOptions
  }

  function handleSearch(e) {
    setQuery(e.target.value)
    setPageNumber(1)
  }

  function handleSearchClick(data) {
    console.log('a collection is selected!')
    setSelectedContractAddress(data.contracts[0])
    setQuery('')
  }

  function renderNftSection() {
    const { contract, nfts, response, total } = collectionNfts

    // get nft html
    const nftsHtml = nfts.map((item, index) => {
      const metadata = item.metadata
      const { name, attributes } = metadata || {}
      const { token_id, file_url } = item
      const isLastElement = nfts.length === index + 1

      const attributesHtml = attributes?.map((item) => {
        let { trait_type, value, display_type } = item || {}

        if (
          typeof value === 'string' &&
          value.includes('0x') &&
          value.length > 20
        ) {
          value = shortenAddress(value)
        } else if (
          typeof value === 'string' &&
          value.includes('Ξ') &&
          value.length > 20
        ) {
          value = shortenAddress(value, 4, 2)
        }

        return (
          <div key={trait_type} className="nft-card--trait">
            <div>{trait_type}</div>
            <div className="trait--value">{value}</div>
          </div>
        )
      })

      return (
        <div
          key={index}
          ref={isLastElement ? lastNftElementRef : null}
          className="nft-card--container"
        >
          <div className="overflow-wrapper">
            <div className="nft-card--image-container">
              <div className="nft-card--image">{renderFile(file_url)}</div>
              <div className="nft-card--tokenId">{'#' + token_id}</div>
              <div className="nft-card--image-overlay">{attributesHtml}</div>
            </div>
          </div>

          <div className="nft-card--name">{name ? name : `#${token_id}`}</div>
        </div>
      )
    })

    return (
      <div className="collection--container">
        <div className="collection--info">
          <img src={contract.metadata.thumbnail_url} />
          <div className="collection--info-text-container">
            <div className="collection--name">{contract.name}</div>
            <div className="collection--total">Total Supply -- {total}</div>
          </div>
          <Select
            id="select"
            value={selectedTraits}
            onChange={setSelectedTraits}
            options={filterOptions}
            isMulti
            placeholder="filter by trait"
            getOptionLabel={(option) => `${option.label} (${option.count})`}
            formatGroupLabel={(data) =>
              `${data.label} -- ${data.options.length}`
            }
          />
        </div>

        <div className="collection-nfts--container">{nftsHtml}</div>
        <div>{loading && 'Loading...'}</div>
        <div>{error && 'ERROR, you are probably scrolling too fast'}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="search--container">
        <input
          type="text"
          id="search"
          value={query}
          onChange={handleSearch}
          autoComplete="off"
          placeholder="search for a collection"
        />

        {loading && !collectionNfts && 'loading...'}

        <div className="search-results--container">
          {collections &&
            collections.data
              .filter((item) => item.verified == true)
              .map((item, index) => {
                return (
                  <SearchResultCard
                    key={index}
                    data={item}
                    handleClick={handleSearchClick}
                  />
                )
              })}
        </div>
      </div>

      {collectionNfts && renderNftSection()}
    </div>
  )
}

export default SearchForm
