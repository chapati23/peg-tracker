import curve from "@curvefi/api"
import { NETWORK_CONSTANTS } from "@curvefi/api/lib/curve.js"
import debug from "./debug.js"
import type { PoolTemplate } from "@curvefi/api/lib/pools/PoolTemplate.js"

export default function getPoolLink(pool: PoolTemplate) {
  const networkName = NETWORK_CONSTANTS[curve.chainId].NAME

  if (!networkName) {
    debug(`❌ Couldn't determine network name for chain ID:`, curve.chainId)
    throw new Error(
      "Couldn't determine network name, likely because 'curve' wasn't initialized yet"
    )
  }
  return `https://curve.fi/\\#/${networkName}/pools/${pool.name}/swap`
}
