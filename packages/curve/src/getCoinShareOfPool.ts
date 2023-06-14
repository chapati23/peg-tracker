import debug from "./debug.js"
import type { PoolTemplate } from "@curvefi/api/lib/pools/PoolTemplate.js"

export default async function getCoinShareOfPool(
  coin: string,
  pool: PoolTemplate
) {
  debug(`[${coin}] Get pool share of ${coin}...`)
  const totalPoolLiquidity = await pool.stats
    .totalLiquidity()
    .then((totalLiquidity) => parseInt(totalLiquidity))

  const indexOfAlertCoin = pool.wrappedCoins.findIndex((val) => val === coin)
  const balanceOfAlertCoin = await pool.stats
    .wrappedBalances()
    // Should be safe because this isn't user input
    // eslint-disable-next-line security/detect-object-injection
    .then((wrappedBalances) => wrappedBalances[indexOfAlertCoin])

  if (!balanceOfAlertCoin) {
    throw new Error(`Couldn't get pool balance of ${coin}`)
  }

  const poolShare = (parseInt(balanceOfAlertCoin) / totalPoolLiquidity) * 100
  debug(`[${coin}] Pool share: ${poolShare.toFixed(2)}%`)

  return poolShare
}
