import { getAlertByCoin } from "alerts"
import { db } from "../index.js"
import debug from "../utils/debug.js"
import getCoinFromCommand from "../utils/getCoinFromCommand.js"
import isTextMessage from "../utils/isTextMessage.js"
import pubsubSetup from "../utils/pubsubSetup.js"
import type { CustomContext } from "../types.js"

export default async function checkAlert(ctx: CustomContext) {
  await ctx.sendChatAction("typing")

  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  const coin = getCoinFromCommand(ctx)
  await ctx.reply(
    `⌛️ Calculating depeg risk for ${coin}, this can take up to 2 minutes...`
  )

  const userId = ctx.message.from.id.toString()
  const alert = await getAlertByCoin(coin, db)

  if (!alert) {
    await ctx.reply(
      `❌ Couldn't find alert for ${coin}. Internal server error.`
    )
    return
  }

  try {
    debug(ctx, `[Check] 🌀️ Checking depeg risk for ${coin} for user ${userId}`)
    const { topic } = await pubsubSetup()
    await topic.publishMessage({
      data: Buffer.from(alert.id),
      attributes: {
        userId: ctx.message.from.id.toString(),
      },
    })
  } catch (error) {
    debug(ctx, `❌ Checking depeg risk for ${coin} failed:`, error)
    await ctx.reply(
      `❌ Couldn't check depeg risk for ${coin} because of an unexpected error`
    )
  }
}
