import { getPoolLiquidity } from "curve"
import { table } from "table"
import { sendChatMsg } from "telegram"
import { getShorthandNumber } from "utils"
import debug from "./debug.js"
import type { PoolTemplate } from "@curvefi/api/lib/pools/PoolTemplate.js"

export default async function printPoolBalances(
  pool: PoolTemplate,
  userId: string
) {
  debug(`📡 Printing Pool Balances for ${pool.name}...`)
  const wrappedBalances = await pool.stats.wrappedBalances()
  const totalLiquidity = await getPoolLiquidity(pool)

  let msg = `<b>Pool Balance: ~${getShorthandNumber(totalLiquidity)}</b>\n`
  const tableData = [["Coin", "Balance", "Percent"]]

  pool.wrappedCoins.forEach((coin, index) => {
    // Should be safe because 'index' is not user input
    // eslint-disable-next-line security/detect-object-injection
    const _balance = wrappedBalances[index]
    if (!_balance) {
      throw new Error(`Unwrapped balance for ${coin} was undefined`)
    }

    const shortBalance = getShorthandNumber(parseFloat(_balance))
    const balanceInPercent = (
      (parseFloat(_balance) / totalLiquidity) *
      100
    ).toFixed(2)

    tableData.push([coin.toUpperCase(), shortBalance, balanceInPercent + "%"])
  })

  msg += `<pre>${table(tableData)}</pre>`

  await sendChatMsg(msg, userId, { parseMode: "HTML" })
  debug(`✅ Printed Pool Balances for ${pool.name}`)
}
