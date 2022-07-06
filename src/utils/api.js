import dotenv from 'dotenv'
dotenv.config

export const API_KEYS = {
  ubiquity: import.meta.env['VITE_UBIQUITY_API_KEY'],
  moralis: import.meta.env['VITE_MORALIS_API_KEY'],
  nftport: import.meta.env['VITE_NFTPORT_API_KEY'],
}
