import { getAlertById } from "alerts"
import { Alert } from "shared-types"
import { escapeMarkdown } from "telegram"
import { findAlertSubscriptionsByUserId } from "user-alerts"
import { db } from "../index.js"
import debug from "../utils/debug.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { CustomContext } from "../types.js"

const currencySymbolMap: { [key: string]: string } = {
  EUR: "💶",
  USD: "💵",
  YEN: "💴",
  GBP: "💷",
}

export default async function listAlertsSubscriptions(ctx: CustomContext) {
  await ctx.sendChatAction("typing")
  await ctx.reply("Loading your alerts...")

  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  let userAlerts

  try {
    userAlerts = await findAlertSubscriptionsByUserId(
      ctx.message.from.id.toString(),
      db
    )
  } catch (error) {
    debug(
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

  if (!userAlerts) {
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        "You don't have any alerts set up yet.\n\nCreate your first one with */add*"
      )
    )
  } else {
    const alertPromises = userAlerts.map((sub) => getAlertById(sub.alertId, db))
    const alerts = (await Promise.all(alertPromises)).filter(
      (alert) => alert !== null
    ) as Alert[] // Typecast: We're explicitly filtering out null results so this should be safe to typecast

    const response = alerts
      .map((alert) => {
        const { coin, referenceAsset } = alert
        const referenceAssetSymbol =
          // Should be safe because referenceAsset is not user input
          // eslint-disable-next-line security/detect-object-injection
          currencySymbolMap[referenceAsset] || `pegged to ${referenceAsset}`
        const coinPadding = coin.length === 3 ? "  " : ""

        return `- ${referenceAssetSymbol} ${coin}${coinPadding}   |  /check_${coin}${coinPadding} 👀  |  /delete_${coin}${coinPadding} ❌`
      })
      .sort()
      .join("\n")

    await ctx.reply(
      `You're tracking the pegs of the following tokens:\n${response}`
    )
  }
}
