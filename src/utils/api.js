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

export function createNftsConfig(selectedCollection, pageNumber) {
  return {
    method: 'GET',
    url: `https://api.nftport.xyz/v0/nfts/${selectedCollection.address}`,
    params: { chain: 'ethereum', include: 'all', page_number: pageNumber },
    headers: nftport_header,
  }
}

export function createTraitsConfig(selectedCollection) {
  return {
    method: 'GET',
    headers: module_header,
    url: `https://api.modulenft.xyz/api/v1/opensea/collection/traits?type=${selectedCollection.address}`,
  }
}

export function createSearchCollectionConfig(query) {
  return {
    method: 'GET',
    url: `https://api.modulenft.xyz/api/v1/central/utilities/search`,
    headers: module_header,
    params: {
      term: query,
      count: 5,
      match: false,
      isVerified: true,
    },
  }
}
