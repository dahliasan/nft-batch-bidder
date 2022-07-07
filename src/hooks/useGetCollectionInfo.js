import { useEffect, useState } from 'react'
import axios from 'axios'
import module_header from '../utils/moduleApiHeader'

export default function useGetCollectionInfo(selectedCollection) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [data, setData] = useState([])

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
      }

      const requests = [traitsConfig, infoConfig].map((endpoint) =>
        axios(endpoint)
      )

      setLoading(true)
      setError(false)

      const [traitsRes, infoRes] = await Promise.all(requests)

      console.log('fetched collection traits...', traitsRes.data)
      console.log('fetched collection info...', infoRes.data)

      setData({ info: infoRes.data, traits: traitsRes.data })
    }

    getCollectionInfo()
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
    return () => cancel()
  }, [selectedCollection])

  return { loading, error, data }
}
