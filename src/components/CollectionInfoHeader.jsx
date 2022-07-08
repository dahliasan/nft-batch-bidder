import React from 'react'
import Select from 'react-select'

export default function CollectionInfoHeader(props) {
  const {
    image,
    name,
    totalSupply,
    selectedTraits,
    traitOptions,
    handleChange,
  } = props

  return (
    <div className="collection--info">
      <img src={image} />
      <div className="collection--info-text-container">
        <div className="collection--name">{name}</div>
        <div className="collection--total">Total Supply -- {totalSupply}</div>
      </div>

      <Select
        id="select"
        value={selectedTraits}
        onChange={handleChange}
        options={traitOptions}
        isMulti
        placeholder="filter by trait"
        getOptionLabel={(option) => `${option.label} (${option.count})`}
        formatGroupLabel={(data) => `${data.label} -- ${data.options.length}`}
      />
    </div>
  )
}

//  <div className="collection--info">
//    <img src={contract.metadata.thumbnail_url} />
//    <div className="collection--info-text-container">
//      <div className="collection--name">{contract.name}</div>
//      <div className="collection--total">Total Supply -- {total}</div>
//    </div>
//    <Select
//      id="select"
//      value={selectedTraits}
//      onChange={setSelectedTraits}
//      options={traitOptions}
//      isMulti
//      placeholder="filter by trait"
//      getOptionLabel={(option) => `${option.label} (${option.count})`}
//      formatGroupLabel={(data) => `${data.label} -- ${data.options.length}`}
//    />
//  </div>
