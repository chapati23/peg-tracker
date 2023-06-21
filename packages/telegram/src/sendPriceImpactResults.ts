import sendChatMsg from "./sendChatMsg.js"
import formatPriceImpactTableForTelegram from "./utils/formatPriceImpactTableForTelegram.js"
import printPriceImpactTableToCli from "./utils/printPriceImpactTableToCli.js"
import type { Alert, PriceImpact } from "shared-types"

export default async function sendPriceImpactResults(options: {
  alert: Alert
  priceImpactResults: PriceImpact[]
  userId: string
}) {
  const { alert, priceImpactResults, userId } = options

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
