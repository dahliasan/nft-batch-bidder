import dotenv from "dotenv";
dotenv.config;

export const COLLECTION_URL = `https://ubiquity.api.blockdaemon.com/v1/nft/ethereum/mainnet/collections/search`;

export const NFT_URL = `https://deep-index.moralis.io/api/v2/nft/`;

export const API_KEYS = {
  ubiquity: import.meta.env["VITE_UBIQUITY_API_KEY"],
  moralis: import.meta.env["VITE_MORALIS_API_KEY"],
};
