import { getAlertSubscriptionsByUserId, getAlertById } from "alerts"
import { Alert } from "shared-types"
import { escapeMarkdown } from "telegram"
import { db } from "../index.js"
import debug from "../utils/debug.js"
import getCurrencyEmoji from "../utils/getCurrencyEmoji.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { CustomContext } from "../types.js"

export default async function listAlertsSubscriptions(ctx: CustomContext) {
  await ctx.sendChatAction("typing")
  await ctx.reply("⏳ Loading your alerts...")

  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  let alertSubscriptions

  try {
    alertSubscriptions = await getAlertSubscriptionsByUserId(
      ctx.message.from.id.toString(),
      db
    )
  } catch (error) {
    debug(
      ctx,
      `❌ Failed to list alert subscriptions for user ${ctx.message.from.id.toString()}:`,
      error
    )
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        "❌ There was a database connection error while running /list.\nTry again, if it keeps happening: Please contact /support"
      )
    )

    return
  }

  if (!alertSubscriptions) {
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        "You don't have any alerts set up yet.\n\nCreate your first one with */add*"
      )
    )
  } else {
    const alertPromises = alertSubscriptions.map((sub) =>
      getAlertById(sub.alertId, db)
    )
    const alerts = (await Promise.all(alertPromises)).filter(
      (alert) => alert !== null
    ) as Alert[] // Typecast: We're explicitly filtering out null results so this should be safe to typecast

    const response = alerts
      .map((alert) => {
        const { coin, referenceAsset } = alert
        const referenceAssetSymbol =
          getCurrencyEmoji(referenceAsset) || referenceAsset
        const coinPadding = coin.length === 3 ? "  " : ""

        return `- ${referenceAssetSymbol} ${coin}${coinPadding}   |  /check\\_${coin}${coinPadding} 👀  |  /delete\\_${coin}${coinPadding} ❌`
      })
      .sort()
      .join("\n")

    await ctx.replyWithMarkdownV2(
      escapeMarkdown(`*Your Peg Alerts*\n\n${response}`)
    )
  }
}
