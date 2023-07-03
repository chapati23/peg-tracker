import debug from "./debug.js"
import type { FilteredPool } from "./getPoolsForCoin.js"
import type { IPoolData } from "@curvefi/api/lib/interfaces.js"

export default function getReferenceAsset(coin: string, pools: FilteredPool[]) {
  let referenceAsset

  // If single pool found => take its reference asset
  if (pools.length === 1 && pools[0]) {
    debug(`[${coin}] Single Pool found:`, pools)
    referenceAsset = pools[0].reference_asset
  }

  // If multiple pools found => check if the reference asset is the same across all pools
  if (pools.length > 1) {
    referenceAsset = findReferenceAssetForMultiplePools(
      coin,
      pools as [NonNullable<IPoolData>]
    )
  }

  debug(`[${coin}] Reference Asset:`, referenceAsset)
  return referenceAsset
}

function findReferenceAssetForMultiplePools(
  coin: string,
  pools: readonly [NonNullable<IPoolData>]
) {
  debug(
    `[${coin}] ${pools.length} Pools found:`,
    pools.map((p) => p.full_name)
  )

  let referenceAsset: string | object
  // If all pools have the same reference asset => great, pick that one
  if (pools.every((obj) => obj.reference_asset === pools[0]?.reference_asset)) {
    referenceAsset = pools[0].reference_asset
    debug(`[${coin}] Same reference asset across all pools:`, referenceAsset)
  } else {
    // if there are different reference assets, pick the most used one
    // NOTE: this logic isn't perfect but should work in most cases
    const counts = pools.reduce<{ [key: string]: number }>((acc, pool) => {
      const _referenceAsset = pool.reference_asset
      // eslint-disable-next-line security/detect-object-injection
      acc[_referenceAsset] = (acc[_referenceAsset] || 0) + 1 // should be safe because this isn't user input
      return acc
    }, {})
    debug(`[${coin}] Different reference assets found`, counts)
    const values = Object.values(counts)

    const firstKey = Object.keys(counts)[0]
    if (values[0] && values[1] && values[0] > values[1] && firstKey) {
      referenceAsset = firstKey
    } else if (values[0] && values[1] && values[0] === values[1]) {
      debug(
        `[${coin}] Multiple reference assets found: ${
          Object.values(counts)[0]
        } / ${Object.values(counts)[1]}`
      )
      referenceAsset = counts
    } else {
      debug(`[${coin}] Could not determine reference asset from:`, counts)
      throw new Error("Could not determine reference asset")
    }
  }

  return referenceAsset
}
