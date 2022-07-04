import IPFSGatewayTools from "@pinata/ipfs-gateway-tools/dist/browser";

const ipfsGatewayTools = new IPFSGatewayTools();

export default function parseMediaUrl(url) {
  const imageContainsCid = ipfsGatewayTools.containsCID(url);
  const ipfsGateway = "https://nftstorage.link";

  let finalUrl;

  if (imageContainsCid.containsCid) {
    finalUrl = ipfsGatewayTools.convertToDesiredGateway(url, ipfsGateway);
  } else {
    finalUrl = url;
  }

  return finalUrl;
}
