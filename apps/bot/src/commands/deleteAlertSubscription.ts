import {
  deleteAlertSubscriptionById,
  getAlertSubscriptionByUserIdAndAlertId,
  getAlertByCoin,
} from "alerts"
import { escapeMarkdown } from "telegram"
import { db } from "../index.js"
import debug from "../utils/debug.js"
import getCoinFromCommand from "../utils/getCoinFromCommand.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { CustomContext } from "../types.js"

export default async function deleteAlertSubscription(ctx: CustomContext) {
  ctx.sendChatAction("typing")

  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  const userId = ctx.message.from.id.toString()
  const coin = getCoinFromCommand(ctx).toUpperCase()
  ctx.replyWithMarkdownV2(escapeMarkdown(`⏳ Deleting *${coin}* alert...`))

  try {
    debug(`[${coin}] 🗑️  Deleting alert subscription for user ${userId}`)

    const alert = await getAlertByCoin(coin, db)

    if (!alert) {
      throw new Error(`Couldn't find alert for ${coin} in DB`)
    }

    const alertSubscription = await getAlertSubscriptionByUserIdAndAlertId(
      userId,
      alert.id,
      db
    )

    if (!alertSubscription) {
      debug(
        `[${coin}] No alert subscription found for alert ID '${alert.id}' and user ID '${userId}'. User might have already deleted it in the past.`
      )
      await ctx.replyWithMarkdownV2(
        escapeMarkdown(
          `ℹ️ Couldn't find alert, you may have already deleted it.\n\nCheck your current alerts with */list*`
        )
      )
    } else {
      await deleteAlertSubscriptionById(alertSubscription.id, db)
      await ctx.replyWithMarkdownV2(
        escapeMarkdown(`✅ Deleted *${coin}* alert`)
      )
    }
  } catch (error) {
    debug(`[${coin}] ❌ Deleting alert failed:`, error)
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        `❌ Couldn't delete *${coin}* alert because of an unexpected error`
      )
    )
  }
}
