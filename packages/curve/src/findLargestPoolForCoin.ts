import curve from "@curvefi/api"
import debug from "./debug.js"

export default async function findLargestPoolForCoin(
  from: string,
  to: string,
  amount = 10_000_000 // default value of 10m should be fine for most cases, but can be overridden if needed
) {
  debug(`[${from}] Find largest pool...`)
  debug(`[${from}] Chain ID:`, curve.chainId)
  const { route } = await curve.router.getBestRouteAndOutput(from, to, amount)

  const poolId = route[0]?.poolId

  if (poolId) {
    // NOTE: I'm not 100% sure if the first array element in the returned pools from the router is actually the largest one but it's my assumption
    const largestPool = curve.getPool(poolId)

    if (!largestPool) {
      throw new Error(`Couldn't find pool '${poolId}' via Curve API`)
    }

    debug(`[${from}] Largest pool found:`, largestPool.fullName)
    return largestPool
  } else {
    throw new Error(
      `Couldn't identify swap route from ${from} to ${to} through Curve Router`
    )
  }
}
