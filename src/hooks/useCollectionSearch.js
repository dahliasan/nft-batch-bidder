// www.youtube.com/watch?v=NZKUirTtxcg

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  createNftsConfig,
  createSearchCollectionConfig,
  createTraitsConfig,
  module_header,
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
  const [loading, setLoading] = useState(false) // change loading to an object
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [data, setData] = useState({})

  // Reset nfts array when a new collection is selected
  useEffect(() => {
    setData((prevData) => ({ ...prevData, collectionNfts: null }))
  }, [selectedCollection])

  // Search for collections
  useEffect(() => {
    const abortCtrl = new AbortController()

    if (query === '') {
      setData((prevData) => ({ ...prevData, collectionSearch: null }))
      setLoading(false)
      setError(null)
      return
    }

    async function searchCollections() {
      setLoading(true)
      setError(null)

      let config = createSearchCollectionConfig(query, {
        signal: abortCtrl.signal,
      })

      const data = await axios(config).then((res) => res.data)
      console.log('--- search collections', data)
      setData((prevData) => ({ ...prevData, collectionSearch: data }))
    }

    searchCollections()
      .catch((error) => {
        if (error.name == 'AbortError') return
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => abortCtrl.abort()
  }, [query])

  // Fetch assets and collection traits after contract is selected

  useEffect(() => {
    if (selectedCollection.address === '' || !selectedCollection.address) return // ignore the first render

    const abortCtrl = new AbortController()

    let contractAddress = selectedCollection.address

    let nftsConfig = createNftsConfig(contractAddress, pageNumber, {
      signal: abortCtrl.signal,
    })

    let traitsConfig = createTraitsConfig(contractAddress)

    const endpoints = [nftsConfig, traitsConfig]

    setLoading(true)
    setError(null)

    Promise.all(endpoints.map((endpoint) => axios(endpoint)))
      .then(([nftsRes, traitsRes]) => {
        console.log('--- collection nfts:', nftsRes)
        console.log('--- collection traits:', traitsRes)

        setData((prevData) => ({ ...prevData, collectionNfts: nftsRes.data }))
        setHasMore(nftsRes.data.total - pageNumber * 50 > 0)

        // get all of collection's traits
        setData((prevData) => ({
          ...prevData,
          collectionTraits: traitsRes.data,
        }))
      })
      .catch((error) => {
        if (error.name == 'AbortError') return
        setError(error)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => abortCtrl.abort()
  }, [selectedCollection])

  // Load more nfts when user scrolls to the bottom of page (infinite scoll feature)
  useEffect(() => {
    if (pageNumber === 1) return

    let contractAddress = selectedCollection.address
    let nftsConfig = createNftsConfig(contractAddress, pageNumber)

    setLoading(true)
    setError(null)
    axios(nftsConfig)
      .then((nftsRes) => {
        setData((prev) => {
          let nftsObj = prev.collectionNfts
          nftsObj = {
            ...nftsObj,
            nfts: [...nftsObj.nfts, ...nftsRes.data.nfts],
          }
          return {
            ...prev,
            collectionNfts: nftsObj,
          }
        })

        setHasMore(nftsRes.data.total - pageNumber * 50 > 0)
      })
      .catch((error) => {
        setError(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [pageNumber])

  // Query collection nfts by selected traits
  // useEffect(() => {
  //   if (selectedTraits.length === 0) return

  //   let cancel

  //   console.log('traits are selected!', selectedTraits)

  //   setLoading(true)
  //   setError(null)

  //   async function getFilteredNfts() {
  //     let attributesParams = selectedTraits
  //       .map((item) => `&stringTraits=${item.value}`)
  //       .join('')

  //     let searchTraits_config = {
  //       method: 'GET',
  //       url:
  //         `https://api.modulenft.xyz/api/v1/opensea/collection/tokens?` +
  //         attributesParams,
  //       params: {
  //         type: data.collectionMetadata.collection,
  //         count: 25,
  //         offset: 0,
  //       },
  //       headers: module_header,
  //       cancelToken: new axios.CancelToken((c) => (cancel = c)),
  //     }

  //     const nfts = await axios(searchTraits_config).then((res) => res.data)

  //     const { count, tokens, totalCountLeft } = nfts
  //     console.log('--- fetched filtered nfts', nfts)

  //     if (count === 0) {
  //       alert('no nfts with this combination!')
  //       return
  //     }

  //     // fetch token metadata with second API call
  //     let tokenIdParams = tokens
  //       .map((token) => `&tokenId=${token.tokenId}`)
  //       .join('')

  //     let metadata_config = {
  //       method: 'get',
  //       headers: module_header,
  //       url:
  //         `https://api.modulenft.xyz/api/v1/metadata/metadata?` + tokenIdParams,
  //       params: { contractAddress: selectedCollection.address },
  //     }

  //     const metadata = await axios(metadata_config).then((res) => res.data)

  //     console.log('--- fetched token metadata', metadata)

  //     let newNftsArr = Object.entries(metadata.metadata).map((token) => {
  //       let [token_id, metadata] = token
  //       return {
  //         token_id: token_id,
  //         metadata: metadata,
  //       }
  //     })

  //     setData((prevData) => {
  //       let nftsObj = prevData.collectionNfts
  //       nftsObj = {
  //         ...nftsObj,
  //         nfts: newNftsArr,
  //       }
  //       return {
  //         ...prevData,
  //         collectionNfts: nftsObj,
  //       }
  //     })
  //   }

  //   getFilteredNfts()
  //     .catch((error) => {
  //       if (axios.isCancel(error)) return
  //       setError(error)
  //     })
  //     .finally(() => {
  //       setLoading(false)
  //     })

  //   return () => cancel()
  // }, [selectedTraits])

  useEffect(() => {
    if (selectedTraits.length === 0) return

    const abortCtrl = new AbortController()
    let collectionName = data.collectionTraits.collection
    let collectionAddress = selectedCollection.address
    let offset = data.collectionNfts?.length || 0

    getTokensApi(collectionName, selectedTraits, offset, {
      signal: abortCtrl.signal,
    })
      .then((tokens) => {
        setHasMore(tokens.tokenCountLeft > 0)
        if (tokens.count > 0) {
          return getTokenMetadataApi(tokens, collectionAddress)
        } else {
          alert('No nfts found :(')
          setError('No nfts found :(')
          throw new Error('No nfts found :(')
        }
      })
      .then((metadata) => {
        setData((prev) => ({
          ...prev,
          collectionNfts: {
            ...prev.collectionNfts,
            nfts: [...normaliseNftData(metadata)],
          },
        }))
      })
      .catch((error) => {
        console.log(error)
        if (error.name == 'AbortError') return
        setError(error)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => abortCtrl.abort()
  }, [selectedTraits])

  return {
    loading,
    error,
    hasMore,
    data,
  }
}
