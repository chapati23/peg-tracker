import curve from "@curvefi/api"
import { NETWORK_CONSTANTS } from "@curvefi/api/lib/curve.js"

export default function getSupportedCoins() {
  const supportedCoins = Object.fromEntries(
     
    Object.entries(NETWORK_CONSTANTS[curve.chainId].COINS).sort((a, b) =>
      a[0].localeCompare(b[0])
    )
  )
  return Object.keys(supportedCoins).map((c) => c.toLowerCase())
}
