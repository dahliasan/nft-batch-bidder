import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchResultCard from "./SearchResultCard.jsx";
import useCollectionSearch from "../hooks/useCollectionSearch.js";
import debounce from "lodash.debounce";
import { COLLECTION_URL, NFT_URL, API_KEYS } from "../utils/api.js";
import parseMediaUrl from "../utils/parseMediaUrl.js";

function SearchForm(props) {
  const [collectionData, setCollectionData] = useState({});
  const { data, loading, error, query, setQuery } = useCollectionSearch(
    COLLECTION_URL,
    API_KEYS.ubiquity
  );
  const [showNfts, setShowNfts] = useState(false);

  const updateQuery = (e) => setQuery(e?.target?.value);
  const debounceOnChange = useCallback(debounce(updateQuery, 200), []); // maybe debounce the useEffect api fetch in useFetch instead

  function handleClick(data, API_KEY = API_KEYS.moralis) {
    console.log("clicked!");
    setShowNfts(false);
    setCollectionData({ ...data });

    function fetchAssets() {
      let url = `${NFT_URL}${data.contracts[0]}?chain=eth&format=decimal&limit=20`;
      let config = {
        headers: {
          accept: "application/json",
          "X-API-Key": API_KEY,
        },
      };

      axios
        .get(url, config)
        .then((response) => {
          setCollectionData((prev) => {
            return {
              ...prev,
              ...response.data,
            };
          });

          setQuery("");
        })
        .catch((err) => {
          console.log(err);
        });
    }

    fetchAssets();
  }

  useEffect(() => {
    console.log(collectionData);
    if (collectionData.result) {
      try {
        setShowNfts(true);
        let object = JSON.parse(collectionData.result[0].metadata);
        console.log(object);
      } catch (err) {
        console.log(err);
      }
    }
  }, [collectionData]);

  function renderNftsFromCollection() {
    const html = collectionData.result.map((item, index) => {
      const metadata = JSON.parse(item.metadata);
      const { name, image } = metadata;
      const { token_id } = item;

      let mediaUrl = parseMediaUrl(image);

      return (
        <div key={index} className="nft-card--container">
          <div className="nft-card--image-container">
            <img className="nft-card--image" src={mediaUrl} />
            <div className="nft-card--tokenId">{"#" + token_id}</div>
          </div>

          <div className="nft-card--name">{name ? name : `#${token_id}`}</div>
        </div>
      );
    });

    return html;
  }

  return (
    <div>
      <div className="search--container">
        <input
          type="text"
          id="search"
          onChange={debounceOnChange}
          autoComplete="off"
          placeholder="search for a collection"
        />

        {loading && "loading..."}

        <div className="search-results--container">
          {data &&
            data.data
              .filter((item) => item.verified == true)
              .map((item, index) => {
                return (
                  <SearchResultCard
                    key={index}
                    data={item}
                    API_KEY={API_KEYS}
                    handleClick={handleClick}
                  />
                );
              })}
        </div>
      </div>

      <div className="collection--container">
        {showNfts && (
          <div className="collection--name">{collectionData.name}</div>
        )}
        <div className="collection-nfts--container">
          {showNfts && renderNftsFromCollection()}
        </div>
      </div>
    </div>
  );
}

export default SearchForm;
