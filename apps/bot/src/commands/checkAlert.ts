import { getAlertByCoin } from "alerts"
import { getTopic } from "pubsub"
import { safeEnvVar } from "utils"
import { db } from "../index.js"
import debug from "../utils/debug.js"
import getCoinFromCommand from "../utils/getCoinFromCommand.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { CustomContext } from "../types.js"

export default async function checkAlert(ctx: CustomContext) {
  await ctx.sendChatAction("typing")

  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  const coin = getCoinFromCommand(ctx)
  await ctx.reply(`⌛️ Analyzing ${coin}...`)

  const userId = ctx.message.from.id.toString()
  const alert = await getAlertByCoin(coin, db)

  if (!alert) {
    await ctx.reply(
      `❌ Couldn't find alert for ${coin}. Internal server error.`
    )
    return
  }

  try {
    debug(
      ctx,
      `📡 Triggering ${coin} price impact calculation for user ${userId}...`
    )
    const pubsubTopic = safeEnvVar(
      `PUBSUB_TOPIC`,
      "Can't communicate with Pubsub without a topic name"
    )
    const topic = await getTopic(pubsubTopic)
    await topic.publishMessage({
      data: Buffer.from(alert.id),
      attributes: {
        userId: ctx.message.from.id.toString(),
      },
    })
    debug(
      ctx,
      `✅ Triggered ${coin} price impact calculation for user ${userId}...`
    )
  } catch (error) {
    debug(ctx, `❌ Checking depeg risk for ${coin} failed:`, error)
    await ctx.reply(
      `❌ Couldn't check depeg risk for ${coin} because of an unexpected error`
    )
  }
}
