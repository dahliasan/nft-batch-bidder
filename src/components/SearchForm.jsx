import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import SearchResultCard from './SearchResultCard.jsx'
import useCollectionSearch from '../hooks/useCollectionSearch.js'
import { resolveUrl, shortenString } from '../utils/helperFunctions.jsx'
import Select from 'react-select'

function SearchForm(props) {
  const [query, setQuery] = useState('')
  const [selectedCollection, setSelectedCollection] = useState({
    name: null,
    address: null,
  })
  const [pageNumber, setPageNumber] = useState(1)
  const [selectedTraits, setSelectedTraits] = useState([])
  const { loading, error, hasMore, data } = useCollectionSearch(
    query,
    selectedCollection,
    pageNumber,
    selectedTraits
  )

  const { collectionSearch, collectionNfts, collectionMetadata } = data || {}

  const traitOptions = useMemo(() => {
    return createTraitOptions()
  }, [collectionMetadata])

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

  function createTraitOptions() {
    if (!collectionMetadata) return

    const { info } = collectionMetadata

    let optionsOutput = []

    Object.entries(info).map((item) => {
      let [type, dataArr] = item

      dataArr.map((trait) => {
        const { key, value, counts } = trait || {}

        let optionsArr
        if (value) {
          // numeric traits only have one option
          let { min, max } = value
          optionsArr = [
            {
              label: `${min}-${max}`,
              value: `${key}:${min}-${max}`,
              min: min,
              max: max,
              count: '',
            },
          ]
        } else if (counts) {
          // string traits can have multiple options
          optionsArr = counts.map((item) => {
            let { value, count } = item
            value = shortenString(value)
            return {
              label: value,
              value: `${key}:${value}`,
              count: count,
            }
          })
        }

        let groupOptionObj = {
          label: key,
          options: optionsArr,
        }

        optionsOutput.push(groupOptionObj)
      })
    })
    return optionsOutput
  }

  function handleSearch(e) {
    setQuery(e.target.value)
    setPageNumber(1)
  }

  function handleSearchClick(name, contractAddress) {
    console.log(`--- collection ${name} ${contractAddress} is selected!`)
    setSelectedCollection({ name: name, address: contractAddress })
    setQuery('')
  }

  function renderNftSection() {
    console.log('--- rendering nfts...', collectionNfts)
    const { contract, nfts, response, total } = collectionNfts || {}

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
            options={traitOptions}
            isMulti
            placeholder="filter by trait"
            getOptionLabel={(option) => `${option.label} (${option.count})`}
            formatGroupLabel={(data) =>
              `${data.label} -- ${data.options.length}`
            }
          />
        </div>

        {loading && selectedTraits.length > 0 ? (
          ''
        ) : (
          <div className="collection-nfts--container">{nftsHtml}</div>
        )}

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
          {collectionSearch &&
            collectionSearch.collections.map((collection, index) => {
              return (
                <SearchResultCard
                  key={index}
                  collection={collection}
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
