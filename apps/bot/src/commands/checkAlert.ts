import { getAlertByCoin } from "alerts"
import { sendDepegRiskResults } from "telegram"
import { db } from "../index.js"
import debug from "../utils/debug.js"
import getCoinFromCommand from "../utils/getCoinFromCommand.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { CustomContext } from "../types.js"

export default async function checkAlert(ctx: CustomContext) {
  ctx.sendChatAction("typing")

  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  const userId = ctx.message.from.id.toString()
  const coin = getCoinFromCommand(ctx)

  ctx.reply("⌛️ Calculating depeg risk, this can take up to 2 minutes...")
  debug(`[Check] 🌀️ Checking depeg risk for ${coin} for user ${userId}`)

  try {
    const alert = await getAlertByCoin(coin, db)

    if (!alert) {
      throw new Error(`Couldn't find alert for ${coin} in DB`)
    }

    await sendDepegRiskResults(userId, alert)
  } catch (error) {
    debug(`❌ Checking depeg risk for ${coin} failed:`, error)
    await ctx.reply(
      `❌ Couldn't check depeg risk for ${coin} because of an unexpected error`
    )
  }
}
