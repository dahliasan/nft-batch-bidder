import { useEffect, useState } from 'react'
import axios from 'axios'
import module_header from '../utils/moduleApiHeader'

export default function useGetTokens(
  selectedCollection,
  pageNumber,
  selectedTraits
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [data, setData] = useState([])

  useEffect(() => {
    setData([])
  }, [selectedCollection, selectedTraits])

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
          offset: data.length,
        },
        headers: module_header,
        cancelToken: new axios.CancelToken((c) => (cancel = c)),
      }

      setLoading(true)
      setError(false)

      const tokens = await axios(config).then((res) => res.data)

      if (tokens.totalCountLeft > 0) setHasMore(true)

      // Fetch nested token metadata
      let newData = tokens.count > 0 ? await getTokenMetadata() : []
      console.log('fetched nfts...', newData)

      setData((prevData) => [...prevData, ...newData])

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

          console.log('--- fetched token metadata', metadata)

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
        setLoading(false)
      })

    return () => cancel()
  }, [selectedCollection, selectedTraits, pageNumber])

  return { loading, error, hasMore, data }
}
