export default function definePegAsset(referenceAsset: string) {
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
