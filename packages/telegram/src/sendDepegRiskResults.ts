import { findLargestPoolForCoin, calculateSellPressureToDepeg } from "curve"
import sendChatMsg from "./sendChatMsg.js"
import formatPriceImpactTableForTelegram from "./utils/formatPriceImpactTableForTelegram.js"
import printPriceImpactTableToCli from "./utils/printPriceImpactTableToCli.js"
import type { PoolTemplate } from "@curvefi/api/lib/pools/PoolTemplate.js"
import type { Alert } from "shared-types"

export default async function sendDepegRiskResults(
  userId: string,
  alert: Alert,
  pool?: PoolTemplate
) {
  const _pool =
    pool || (await findLargestPoolForCoin(alert.coin, alert.peggedTo))
  const totalPoolLiquidity = await _pool.stats
    .totalLiquidity()
    .then((totalLiquidity) => parseInt(totalLiquidity))

  const priceImpactResults = await calculateSellPressureToDepeg(
    alert.coin,
    alert.peggedTo,
    totalPoolLiquidity
  )

  if (process.env["DEBUG"]) {
    await printPriceImpactTableToCli(alert, priceImpactResults)
  }

  await sendChatMsg(
    formatPriceImpactTableForTelegram(alert, priceImpactResults),
    userId,
    {
      parseMode: "HTML",
    }
  )
}
