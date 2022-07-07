// www.youtube.com/watch?v=NZKUirTtxcg

import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_KEYS } from '../utils/api.js'

const module_header = {
  Accept: 'application/json',
  'X-API-KEY': API_KEYS.module,
}

function useCollectionSearch(
  query,
  selectedCollection,
  pageNumber,
  selectedTraits
) {
  const [loading, setLoading] = useState(false) // change loading to an object
  const [error, setError] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [data, setData] = useState({})

  useEffect(() => {
    setData((prevData) => ({ ...prevData, collectionNfts: null }))
  }, [selectedCollection])

  // Collection search
  useEffect(() => {
    let cancel

    if (!query) {
      setData((prevData) => ({ ...prevData, collectionSearch: null }))
      setLoading(false)
      setError(false)
      return
    }

    async function searchCollections() {
      setLoading(true)
      setError(false)

      const config = {
        method: 'GET',
        url: `https://api.modulenft.xyz/api/v1/central/utilities/search`,
        headers: module_header,
        params: {
          term: query,
          count: 5,
          match: false,
          isVerified: true,
        },
        cancelToken: new axios.CancelToken((c) => (cancel = c)),
      }

      const data = await axios(config).then((res) => res.data)
      console.log('--- search collections', data)
      setData((prevData) => ({ ...prevData, collectionSearch: data }))
    }

    searchCollections()
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => cancel()
  }, [query])

  // Fetch assets and collection traits after contract is selected
  let collectionNfts_config = {
    method: 'GET',
    url: `https://api.nftport.xyz/v0/nfts/${selectedCollection.address}`,
    params: { chain: 'ethereum', include: 'all', page_number: pageNumber },
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEYS.nftport,
    },
  }

  let collectionTraits_config = {
    method: 'GET',
    headers: module_header,
    url: `https://api.modulenft.xyz/api/v1/opensea/collection/traits?type=${selectedCollection.address}`,
  }

  useEffect(() => {
    if (!selectedCollection.address || selectedTraits.length > 0) return
    let cancel

    collectionNfts_config = {
      ...collectionNfts_config,
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    }

    const endpoints = [collectionNfts_config, collectionTraits_config]

    setLoading(true)
    setError(false)
    Promise.all(endpoints.map((endpoint) => axios(endpoint)))
      .then(([nftsRes, traitsRes]) => {
        console.log('--- collection nfts:', nftsRes)
        console.log('--- collection traits:', traitsRes)

        setData((prevData) => ({ ...prevData, collectionNfts: nftsRes.data }))
        setHasMore(nftsRes.data.total - pageNumber * 50 > 0)

        // get all of collection's traits
        setData((prevData) => ({
          ...prevData,
          collectionMetadata: traitsRes.data,
        }))
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => cancel()
  }, [selectedCollection, selectedTraits])

  // Load more nfts when user scrolls to the bottom of page (infinite scoll feature)
  useEffect(() => {
    if (!selectedCollection.address || selectedTraits.length > 0) return // ignore first render

    let cancel
    collectionNfts_config = {
      ...collectionNfts_config,
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    }
    setLoading(true)
    setError(false)
    axios(collectionNfts_config)
      .then((nftsRes) => {
        setData((prevData) => {
          let nftsObj = prevData.collectionNfts
          nftsObj = {
            ...nftsObj,
            nfts: [...nftsObj.nfts, ...nftsRes.data.nfts],
          }
          return {
            ...prevData,
            collectionNfts: nftsObj,
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

  // Query collection nfts by selected traits
  useEffect(() => {
    if (selectedTraits.length === 0) return

    let cancel
    console.log('traits are selected!', selectedTraits)

    setLoading(true)
    setError(false)

    async function getFilteredNfts() {
      let attributesParams = selectedTraits
        .map((item) => `&stringTraits=${item.value}`)
        .join('')

      let searchTraits_config = {
        method: 'GET',
        url:
          `https://api.modulenft.xyz/api/v1/opensea/collection/tokens?` +
          attributesParams,
        params: {
          type: data.collectionMetadata.collection,
          count: 25,
          offset: 0,
        },
        headers: module_header,
        cancelToken: new axios.CancelToken((c) => (cancel = c)),
      }

      const nfts = await axios(searchTraits_config).then((res) => res.data)

      const { count, tokens, totalCountLeft } = nfts
      console.log('--- fetched filtered nfts', nfts)

      if (count === 0) {
        alert('no nfts with this combination!')
        return
      }

      // fetch token metadata with second API call
      let tokenIdParams = tokens
        .map((token) => `&tokenId=${token.tokenId}`)
        .join('')

      let metadata_config = {
        method: 'get',
        headers: module_header,
        url:
          `https://api.modulenft.xyz/api/v1/metadata/metadata?` + tokenIdParams,
        params: { contractAddress: selectedCollection.address },
      }

      const metadata = await axios(metadata_config).then((res) => res.data)

      console.log('--- fetched token metadata', metadata)

      let newNftsArr = Object.entries(metadata.metadata).map((token) => {
        let [token_id, metadata] = token
        return {
          token_id: token_id,
          metadata: metadata,
        }
      })

      setData((prevData) => {
        let nftsObj = prevData.collectionNfts
        nftsObj = {
          ...nftsObj,
          nfts: newNftsArr,
        }
        return {
          ...prevData,
          collectionNfts: nftsObj,
        }
      })
    }

    getFilteredNfts()
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => cancel()
  }, [selectedTraits])

  return {
    loading,
    error,
    hasMore,
    data,
  }
}

export default useCollectionSearch
