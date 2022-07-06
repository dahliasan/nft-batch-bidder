import { useEffect, useState } from 'react'
import axios from 'axios'

export default function useAssetTraitSearch(
  contractAddress,
  pageToken,
  attributes
) {
  const config = {
    headers: { Authorization: `Bearer ${API_KEY}` },
    params: {
      contract_address: contractAddress,
      page_token: pageToken,
    },
  }

  useEffect(() => {}, [contractAddress, pageToken])

  return null
}
