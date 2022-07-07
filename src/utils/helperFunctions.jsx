import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/browser'

export function resolveUrl(url) {
  // svg help source: https://dev.to/benjaminblack/using-a-string-of-svg-as-an-image-source-8mo

  let html
  const ipfsGatewayTools = new IPFSGatewayTools()
  if (!url) return <div className="nft-card--image-placeholder" />

  const isIpfs = url.includes('ipfs://')
  const ipfsGateway = 'https://nftstorage.link'
  const isSvg = url.includes('</svg>')
  url = url.replace('storage.opensea.io', 'openseauserdata.com')

  if (isIpfs) {
    html = (
      <img src={ipfsGatewayTools.convertToDesiredGateway(url, ipfsGateway)} />
    )
  } else if (isSvg) {
    try {
      let svg = url
      let blob = new Blob([svg], { type: 'image/svg+xml' })
      let svgUrl = URL.createObjectURL(blob)
      html = <img src={svgUrl} />
    } catch (err) {
      console.log(err)
    }
  } else {
    html = <img src={url} />
  }

  return html
}

export function shortenAddress(str, startLength = 6, endLength = 4) {
  return (
    str.substring(0, startLength) +
    '...' +
    str.substring(str.length - endLength)
  )
}

export function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export function shortenString(value) {
  if (typeof value === 'string' && value.includes('0x') && value.length > 20) {
    value = shortenAddress(value)
  } else if (
    typeof value === 'string' &&
    value.includes('Ξ') &&
    value.length > 20
  ) {
    value = shortenAddress(value, 4, 2)
  }
  return value
}
