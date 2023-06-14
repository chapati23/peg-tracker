import { escapeMarkdown } from "telegram"
import { createAlertSubscription } from "user-alerts"
import { db } from "../../index.js"
import isCallback from "../../utils/isCallbackMessage.js"
import type { CustomContext } from "../../types.js"

// If multiple reference assets were found, ask the user which one to use as the peg reference
export default async function step3SelectReferenceAssetManually(
  ctx: CustomContext
) {
  if (!isCallback(ctx.update)) {
    throw new Error(
      `ctx.update ist not a callback message but was: ${ctx.update}`
    )
  }

  const referenceAsset = ctx.update.callback_query.data

  await createAlertSubscription(
    ctx.session.userId,
    ctx.session.coin,
    referenceAsset,
    db
  )
  await ctx.replyWithMarkdownV2(
    escapeMarkdown(
      `✅ Set up new peg alert for *${ctx.session.coin}* (tracking ${referenceAsset})`
    )
  )

  return await ctx.scene.leave()
}
