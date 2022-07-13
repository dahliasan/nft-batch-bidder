import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config

export const API_KEYS = {
  ubiquity: import.meta.env['VITE_UBIQUITY_API_KEY'],
  moralis: import.meta.env['VITE_MORALIS_API_KEY'],
  nftport: import.meta.env['VITE_NFTPORT_API_KEY'],
  module: import.meta.env['VITE_MODULE_API_KEY'],
}

export const module_header = {
  Accept: 'application/json',
  'X-API-KEY': API_KEYS.module,
}

export const nftport_header = {
  'Content-Type': 'application/json',
  Authorization: API_KEYS.nftport,
}

export function createNftsConfig(contractAddress, pageNumber, options) {
  return {
    method: 'GET',
    url: `https://api.nftport.xyz/v0/nfts/${contractAddress}`,
    params: { chain: 'ethereum', include: 'all', page_number: pageNumber },
    headers: nftport_header,
    ...options,
  }
}

export function createTraitsConfig(contractAddress) {
  return {
    method: 'GET',
    headers: module_header,
    url: `https://api.modulenft.xyz/api/v1/opensea/collection/traits?type=${contractAddress}`,
  }
}

export function createCollectionInfoConfig(contractAddress) {
  return {
    method: 'GET',
    headers: module_header,
    url: `https://api.modulenft.xyz/api/v1/opensea/collection/info?type=${contractAddress}`,
  }
}

export function createSearchCollectionConfig(
  query,
  options,
  count = 5,
  isVerified = true,
  match = false
) {
  return {
    method: 'GET',
    url: `https://api.modulenft.xyz/api/v1/central/utilities/search`,
    headers: module_header,
    params: {
      term: query,
      count: count,
      match: match,
      isVerified: isVerified,
    },
    ...options,
  }
}

export async function getTokensApi(
  collection,
  selectedTraits,
  offset = 0,
  options = {}
) {
  try {
    const config = createTokensConfig(
      selectedTraits,
      collection,
      offset,
      options
    )

    const response = await axios(config)
    const data = response.data
    console.log('fetched tokens...', response)
    return data
  } catch (error) {
    console.log('get token api error!')
    console.log(error)
  }
}

export function createTokensConfig(
  selectedTraits,
  collection,
  offset,
  options
) {
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
      type: collection,
      count: 25,
      offset: offset,
    },
    headers: module_header,
    ...options,
  }
  return config
}

export async function getTokenMetadataApi(tokens, contractAddress, options) {
  try {
    const tokenIdParams = tokens.tokens
      .map((token) => `&tokenId=${token.tokenId}`)
      .join('')

    const config = {
      method: 'get',
      headers: module_header,
      url:
        `https://api.modulenft.xyz/api/v1/metadata/metadata?` + tokenIdParams,
      params: { contractAddress: contractAddress },
      ...options,
    }

    const response = await axios(config)
    const data = response.data
    console.log('fetched token metadata...', response)

    return data
  } catch (error) {
    if (error.name === 'CanceledError') return
    console.log(error)
  }
}

export function normaliseNftData(tokenMetadata) {
  try {
    return Object.entries(tokenMetadata.metadata).map((token) => {
      let [token_id, metadata] = token
      return {
        token_id: token_id,
        metadata: metadata,
      }
    })
  } catch (error) {
    console.log(error)
    return []
  }
}
