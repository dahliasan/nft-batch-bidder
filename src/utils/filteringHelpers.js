import { shortenString } from '../utils/helperFunctions.jsx'

export function createTraitOptions(collectionTraits) {
  if (!collectionTraits) return

  const { info } = collectionTraits

  let optionsOutput = []

  Object.entries(info).map((item) => {
    let [type, dataArr] = item

    dataArr.map((trait) => {
      const { key, value, counts } = trait || {}

      let optionsArr
      if (value) {
        // numeric traits only have one option
        let { min, max } = value
        optionsArr = [
          {
            label: `${min}-${max}`,
            value: `${key}:${min}-${max}`,
            min: min,
            max: max,
            count: '',
          },
        ]
      } else if (counts) {
        // string traits can have multiple options
        optionsArr = counts.map((item) => {
          let { value, count } = item
          value = shortenString(value)
          return {
            label: value,
            value: `${key}:${value}`,
            count: count,
          }
        })
      }

      let groupOptionObj = {
        label: key,
        options: optionsArr,
      }

      optionsOutput.push(groupOptionObj)
    })
  })
  return optionsOutput
}
