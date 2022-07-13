// www.youtube.com/watch?v=NZKUirTtxcg

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  createNftsConfig,
  createSearchCollectionConfig,
  createTraitsConfig,
  createTokensConfig,
  createCollectionInfoConfig,
  getTokensApi,
  getTokenMetadataApi,
  normaliseNftData,
} from '../utils/api.js'

export default function useCollectionSearch(
  query,
  selectedCollection,
  pageNumber,
  selectedTraits
) {
  const [loading, setLoading] = useState({}) // change loading to an object
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [data, setData] = useState({})

  // Reset nfts array when a new collection is selected
  useEffect(() => {
    setData({})
    setError(null)
    setLoading({})
    setHasMore(null)
  }, [selectedCollection])

  // Search for collections

  useEffect(() => {
    console.log('---------------------')
    console.log('collection search useEffect triggered')
    console.log('---------------------')
    const abortController = new AbortController()

    if (query === '') {
      setData((prevData) => ({ ...prevData, collectionSearch: null }))
      setLoading((prev) => ({ ...prev, search: false }))
      setError(null)
      return
    }

    async function searchCollections() {
      setLoading((prev) => ({ ...prev, search: true }))
      setError(null)

      let config = createSearchCollectionConfig(query, {
        signal: abortController.signal,
      })

      const data = await axios(config).then((res) => res.data)
      console.log('--- search collections', data)
      setData((prevData) => ({ ...prevData, collectionSearch: data }))
    }

    searchCollections()
      .catch((error) => {
        if (error.name === 'CanceledError') return
        console.log(error)
        setError('The request failed. Please try again later.')
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, search: false }))
      })

    return () => abortController.abort()
  }, [query])

  useEffect(() => {
    console.log('---------------------')
    console.log('selected useEffect triggered')
    console.log('---------------------')
    if (selectedCollection.address === '' || !selectedCollection.address) return // ignore the first render

    const abortController = new AbortController()
    let contractAddress = selectedCollection.address
    let offset = 0

    let nftsConfig = createTokensConfig([], contractAddress, offset, {
      signal: abortController.signal,
    })
    let traitsConfig = createTraitsConfig(contractAddress)
    let collectionInfoConfig = createCollectionInfoConfig(contractAddress)
    const endpoints = [nftsConfig, traitsConfig, collectionInfoConfig]

    setLoading((prev) => ({ ...prev, nfts: true }))
    setError(null)

    Promise.all(endpoints.map((endpoint) => axios(endpoint)))
      .then(([tokensRes, traitsRes, infoRes]) => {
        console.log('collection nfts:', tokensRes)
        console.log('collection traits:', traitsRes)
        console.log('collection info:', infoRes)

        setData((prevData) => ({
          ...prevData,
          collectionTraits: traitsRes.data,
          collectionInfo: infoRes.data,
        }))

        return tokensRes.data
      })
      .then((tokens) => {
        setData((prev) => ({ ...prev, collectionNftStats: tokens }))
        setHasMore(tokens.tokenCountLeft > 0)
        if (tokens.count > 0) {
          return getTokenMetadataApi(tokens, contractAddress)
        } else {
          setError('No nfts found :(')
          throw 'No nfts found :('
        }
      })
      .then((metadata) => {
        setData((prev) => ({
          ...prev,
          collectionNfts: [...normaliseNftData(metadata)],
        }))

        console.log(normaliseNftData(metadata))
      })
      .catch((error) => {
        if (error.name === 'CanceledError') return
        console.log(error)
        setError(error)
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, nfts: false }))
      })

    return () => abortController.abort()
  }, [selectedCollection])

  // Fetch nfts after filtering traits are selected
  useEffect(() => {
    console.log('---------------------')
    console.log('filter traits useEffect triggered')
    console.log('---------------------')
    if (!selectedTraits) return

    const abortController = new AbortController()
    let collectionName = data.collectionTraits.collection
    let contractAddress = selectedCollection.address
    let offset = 0

    setLoading((prev) => ({ ...prev, nfts: true }))
    setError(null)
    getTokensApi(collectionName, selectedTraits, offset, {
      signal: abortController.signal,
    })
      .then(async (tokens) => {
        try {
          setLoading((prev) => ({ ...prev, nfts: true }))
          setHasMore(tokens.tokenCountLeft > 0)
          setData((prev) => ({ ...prev, collectionNftStats: tokens }))

          if (tokens.count > 0) {
            const metadata = await getTokenMetadataApi(
              tokens,
              contractAddress,
              {
                signal: abortController.signal,
              }
            )
            setData((prev) => ({
              ...prev,
              collectionNfts: [...normaliseNftData(metadata)],
            }))
          } else {
            setError('Error: no matching nfts found :(')
          }
        } catch (error) {
          console.log('error 1')
          console.log(error)
          setError('Error: no matching nfts found :(')
        }
      })
      .catch((error) => {
        if (error.name === 'CanceledError') return
        console.log('error 2', error)
        setError(error)
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, nfts: false }))
      })

    return () => abortController.abort()
  }, [selectedTraits])

  // Load more nfts when user scrolls to the bottom of page (infinite scoll feature)
  // useEffect(() => {
  //   if (pageNumber === 1) return

  //   let contractAddress = selectedCollection.address
  //   let nftsConfig = createNftsConfig(contractAddress, pageNumber)

  //   setLoading(true)
  //   setError(null)
  //   axios(nftsConfig)
  //     .then((nftsRes) => {
  //       setData((prev) => {
  //         let nftsObj = prev.collectionNfts
  //         nftsObj = {
  //           ...nftsObj,
  //           nfts: [...nftsObj.nfts, ...nftsRes.data.nfts],
  //         }
  //         return {
  //           ...prev,
  //           collectionNfts: nftsObj,
  //         }
  //       })

  //       setHasMore(nftsRes.data.total - pageNumber * 50 > 0)
  //     })
  //     .catch((error) => {
  //       setError(error)
  //     })
  //     .finally(() => {
  //       setLoading(false)
  //     })
  // }, [pageNumber])

  return {
    loading,
    error,
    hasMore,
    data,
  }
}
