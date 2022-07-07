// www.youtube.com/watch?v=NZKUirTtxcg

import { useEffect, useState } from 'react'
import axios from 'axios'
import module_header from '../utils/moduleApiHeader'

export default function useSearchCollections(query) {
  const [loading, setLoading] = useState(false) // change loading to an object?
  const [error, setError] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancel

    if (!query) {
      setData(null)
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

      const collections = await axios(config).then((res) => res.data)
      console.log('search collections...', collections)
      setData(collections)
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

  return { loading, error, data }
}
