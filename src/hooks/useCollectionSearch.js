// source: https://github.com/machadop1407/custom-use-fetch-hook-react/blob/main/src/useFetch.js
// source: https://medium.com/swlh/creating-react-hook-for-fetching-data-4193d8479138

import { useEffect, useState } from "react";
import axios from "axios";

function useCollectionSearch(url, API_KEY) {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${API_KEY}` },
    params: {
      name: query,
    },
  };

  useEffect(() => {
    if (query) {
      setLoading(true);
      axios
        .get(url, config)
        .then((response) => {
          setData(response.data);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [query]);

  //   const refetch = () => {
  //   setLoading(true);
  //   axios
  //     .get(url)
  //     .then((response) => {
  //       setData(response.data);
  //     })
  //     .catch((err) => {
  //       setError(err);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  function fetchAssets(url, config) {
    setLoading(true);
    axios
      .get(url, config)
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return { query, data, loading, error, setQuery, setLoading };
}

export default useFetch;
