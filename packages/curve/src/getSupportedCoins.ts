import curve from "@curvefi/api"
import { NETWORK_CONSTANTS } from "@curvefi/api/lib/curve.js"
import debug from "./debug.js"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function getSupportedCoins(retryCount = 0) {
  if (!curve.chainId) {
    // Because we're lazily initializing the Curve API, there's a possibility for a race condition upon startup of the cloud function
    // We'll retry this once to minimize the occurrence of said race condition.
    // If the curve API isn't ready after 2 seconds, something is probably broken.
    if (retryCount === 0) {
      debug(
        `[${getSupportedCoins.name}] It looks like the Curve API isn't ready yet. Retrying with a 3sec timeout...`
      )
      await delay(2000)
      getSupportedCoins(retryCount + 1)
    } else {
      throw new Error(
        `[${getSupportedCoins.name}] It looks like the Curve API isn't ready yet. Chain ID was: ${curve.chainId}`
      )
    }
  }

  const supportedCoins = Object.fromEntries(
    Object.entries(NETWORK_CONSTANTS[curve.chainId].COINS).sort((a, b) =>
      a[0].localeCompare(b[0])
    )
  )

  return Object.keys(supportedCoins).map((c) => c.toLowerCase())
}
