import { useEffect, useState } from 'react'
import axios from 'axios'
import module_header from '../utils/moduleApiHeader'

export default function useGetCollectionData(
  selectedCollection,
  pageNumber,
  selectedTraits
) {
  const [loading, setLoading] = useState({
    infoLoading: false,
    nftsLoading: false,
  })
  const [error, setError] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [data, setData] = useState({
    collectionNfts: [],
    collectionInfo: {},
  })

  useEffect(() => {
    setData((prevData) => ({ ...prevData, collectionNfts: [] }))
  }, [selectedTraits])

  useEffect(() => {
    setData({
      collectionNfts: [],
      collectionInfo: {},
    })
  }, [selectedCollection])

  useEffect(() => {
    if (!selectedCollection.address) return

    let cancel

    async function getTokens() {
      const traitsParams =
        selectedTraits.length > 0
          ? selectedTraits.map((item) => `&stringTraits=${item.value}`).join('')
          : ''

      const config = {
        method: 'GET',
        url:
          `https://api.modulenft.xyz/api/v1/opensea/collection/tokens?` +
          traitsParams,
        params: {
          type: selectedCollection.address,
          count: 25,
          offset: data.collectionNfts.length,
        },
        headers: module_header,
        cancelToken: new axios.CancelToken((c) => (cancel = c)),
      }

      setLoading((prevData) => ({ ...prevData, nftsLoading: true }))

      setError(false)

      const tokens = await axios(config).then((res) => res.data)

      if (tokens.totalCountLeft > 0) setHasMore(true)

      // Fetch nested token metadata
      let newData = tokens.count > 0 ? await getTokenMetadata() : []
      console.log('fetched nfts...', newData)

      setData((prevData) => ({
        ...prevData,
        collectionNfts: [...prevData.collectionNfts, ...newData],
      }))

      async function getTokenMetadata() {
        try {
          const tokenIdParams = tokens.tokens
            .map((token) => `&tokenId=${token.tokenId}`)
            .join('')

          const config = {
            method: 'get',
            headers: module_header,
            url:
              `https://api.modulenft.xyz/api/v1/metadata/metadata?` +
              tokenIdParams,
            params: { contractAddress: selectedCollection.address },
          }

          const metadata = await axios(config).then((res) => res.data)

          let combinedData = Object.entries(metadata.metadata).map((token) => {
            let [token_id, metadata] = token
            return {
              token_id: token_id,
              metadata: metadata,
            }
          })

          return combinedData
        } catch (e) {
          console.log(e)
        }
      }
    }

    getTokens()
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(true)
      })
      .finally(() => {
        setLoading((prevData) => ({ ...prevData, nftsLoading: false }))
      })

    return () => cancel()
  }, [selectedCollection, selectedTraits, pageNumber])

  useEffect(() => {
    if (!selectedCollection.address) return

    let cancel

    async function getCollectionInfo() {
      const traitsConfig = {
        method: 'GET',
        headers: module_header,
        url: `https://api.modulenft.xyz/api/v1/opensea/collection/traits?type=${selectedCollection.address}`,
      }

      const infoConfig = {
        method: 'GET',
        headers: module_header,
        url: `https://api.modulenft.xyz/api/v1/opensea/collection/info?type=${selectedCollection.address}`,
        cancelToken: new axios.CancelToken((c) => (cancel = c)),
      }

      const requests = [traitsConfig, infoConfig].map((endpoint) =>
        axios(endpoint)
      )

      setLoading((prevData) => ({ ...prevData, infoLoading: true }))

      setError(false)

      const [traitsRes, infoRes] = await Promise.all(requests)

      console.log('fetched collection traits...', traitsRes.data)
      console.log('fetched collection info...', infoRes.data)

      setData((prevData) => ({
        ...prevData,
        collectionInfo: { info: infoRes.data, traits: traitsRes.data },
      }))
    }

    getCollectionInfo()
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(true)
      })
      .finally(() => {
        setLoading((prevData) => ({ ...prevData, infoLoading: false }))
      })
    return () => cancel()
  }, [selectedCollection])

  return { loading, error, hasMore, data }
}
