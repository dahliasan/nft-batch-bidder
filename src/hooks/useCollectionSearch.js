// www.youtube.com/watch?v=NZKUirTtxcg

import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_KEYS } from '../utils/api.js'

function useCollectionSearch(
  query,
  selectedContractAddress,
  pageNumber,
  selectedTraits
) {
  const [loading, setLoading] = useState(false) // change loading to an object
  const [error, setError] = useState(false)
  const [collections, setCollections] = useState(null) // create a response object and consolidate the different responses inside.
  const [collectionNfts, setCollectionNfts] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [collectionInfo, setCollectionInfo] = useState(null)

  useEffect(() => {
    setCollectionNfts(null)
  }, [selectedContractAddress])

  // Fetch collections from search query
  useEffect(() => {
    let cancel
    const config = {
      method: 'GET',
      url: `https://ubiquity.api.blockdaemon.com/v1/nft/ethereum/mainnet/collections/search`,
      headers: { Authorization: `Bearer ${API_KEYS.ubiquity}` },
      params: {
        name: query,
      },
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    }
    setLoading(true)
    setError(false)
    if (query) {
      axios(config)
        .then((res) => {
          console.log('search collections', res.data)
          setCollections(res.data)
          setLoading(false)
        })
        .catch((err) => {
          if (axios.isCancel(err)) return
          setError(true)
        })
    } else {
      setCollections(null)
      setLoading(false)
      setError(false)
    }

    return () => cancel()
  }, [query])

  // Fetch assets after a collection is selected
  let getCollectionNftsConfig = {
    method: 'GET',
    url: `https://api.nftport.xyz/v0/nfts/${selectedContractAddress}`,
    params: { chain: 'ethereum', include: 'all', page_number: pageNumber },
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEYS.nftport,
    },
  }

  // we use this API endpoint to get collection's opensea slug
  let getContractInfoConfig = {
    method: 'GET',
    url: `https://api.opensea.io/api/v1/asset_contract/${selectedContractAddress}`,
  }

  useEffect(() => {
    let cancel

    getCollectionNftsConfig = {
      ...getCollectionNftsConfig,
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    }

    const contractEndpoints = [getCollectionNftsConfig, getContractInfoConfig]

    setLoading(true)
    setError(false)
    if (selectedContractAddress) {
      Promise.all(contractEndpoints.map((endpoint) => axios(endpoint)))
        .then(([nftsRes, contractRes]) => {
          console.log(nftsRes, contractRes)

          setCollectionNfts(nftsRes.data)
          setHasMore(nftsRes.data.total - pageNumber * 50 > 0)

          // get all of collection's traits and values from Opensea API
          let slug = contractRes.data.collection.slug
          const getCollectionInfoConfig = {
            method: 'get',
            url: `https://api.opensea.io/api/v1/collection/${slug}`,
          }
          axios(getCollectionInfoConfig).then((res) => {
            console.log(res.data)
            setCollectionInfo(res.data.collection)
          })
        })
        .catch((err) => {
          if (axios.isCancel(err)) return
          setError(true)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
      setError(false)
    }

    return () => cancel()
  }, [selectedContractAddress])

  // Load more nfts when user scrolls to the bottom of page
  useEffect(() => {
    if (!selectedContractAddress) return // ignore first render
    let cancel
    getCollectionNftsConfig = {
      ...getCollectionNftsConfig,
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    }
    setLoading(true)
    setError(false)
    axios(getCollectionNftsConfig)
      .then((nftsRes) => {
        setCollectionNfts((prevData) => {
          return {
            ...prevData,
            nfts: [...prevData.nfts, ...nftsRes.data.nfts],
          }
        })
        setHasMore(nftsRes.data.total - pageNumber * 50 > 0)
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => cancel()
  }, [pageNumber])

  useEffect(() => {
    if (!selectedTraits) return
  }, [selectedTraits])

  return {
    collections,
    loading,
    error,
    collectionNfts,
    hasMore,
    collectionInfo,
  }
}

export default useCollectionSearch
