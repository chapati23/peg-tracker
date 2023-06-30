import debug from "./debug.js"
import type { PoolTemplate } from "@curvefi/api/lib/pools/PoolTemplate.js"

export default async function getPoolLiquidity(pool: PoolTemplate) {
  let totalPoolLiquidity
  try {
    totalPoolLiquidity = await pool.stats
      .totalLiquidity()
      .then((totalLiquidity) => parseInt(totalLiquidity))
  } catch (error) {
    debug(
      `[${getPoolLiquidity.name}] Couldn't get pool liquidity for pool:`,
      pool
    )
    throw error
  }

  return totalPoolLiquidity
}
