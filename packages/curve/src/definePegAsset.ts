const validReferenceAssets = ["USD", "EUR", "BTC", "ETH", "CRYPTO"]
export default function definePegAsset(referenceAsset: string) {
  if (!validReferenceAssets.includes(referenceAsset)) {
    throw new Error(
      `[${
        definePegAsset.name
      }] You passed an invalid reference asset: ${referenceAsset}\nSupported reference assets are: ${validReferenceAssets.join(
        ", "
      )}`
    )
  }

  let peggedTo

  switch (referenceAsset) {
    case "USD":
      peggedTo = "USDC"
      break
    case "EUR":
      peggedTo = "EUROC"
      break
    case "BTC":
      peggedTo = "WBTC"
      break
    case "ETH":
      peggedTo = "ETH"
      break
    case "CRYPTO":
      peggedTo = undefined
      break
  }

  if (!peggedTo) {
    throw new Error(
      `Could not define peg asset for reference asset '${referenceAsset}'`
    )
  }

  return peggedTo
}
