import { useState, useEffect } from "react";

function SearchResultCard(props) {
  const { data, API_KEY, handleClick } = props;

  return (
    <div
      className="search-result--container"
      onClick={() => {
        handleClick(data);
      }}
    >
      <img
        className="search-result--logo"
        src={`${data.logo}?apiKey=${API_KEY.ubiquity}`}
      />

      <div className="search-result--name">{data.name}</div>
    </div>
  );
}

export default SearchResultCard;
