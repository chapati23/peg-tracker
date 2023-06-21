import { createAlertSubscription } from "alerts"
import {
  definePegAsset,
  findLargestPoolForCoin,
  getCoinShareOfPool,
} from "curve"
import { escapeMarkdown } from "telegram"
import { db } from "../../index.js"
import debug from "../../utils/debug.js"
import getCurrencyEmoji from "../../utils/getCurrencyEmoji.js"
import isCallback from "../../utils/isCallback.js"
import type { CustomContext } from "../../types.js"

// If multiple reference assets were found, ask the user which one to use as the peg reference
export default async function step3SelectReferenceAssetManually(
  ctx: CustomContext
) {
  if (!isCallback(ctx.update)) {
    debug("ctx.update ist not a callback message but was:", ctx.update)
    await ctx.reply(
      "Please select the correct reference asset by clicking one of the provided buttons"
    )

    return ctx.wizard.selectStep(ctx.wizard.cursor) // Re-run the current step to allow user to select a reference asset
  }

  if (!ctx.session.coin) throw new Error("ctx.session.coin is undefined")

  try {
    const coin = ctx.session.coin
    const referenceAsset = ctx.update.callback_query.data
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        `⏳ Storing reference asset for *${coin}* ${getCurrencyEmoji(
          referenceAsset
        )}...`
      )
    )

    const peggedTo = definePegAsset(referenceAsset)
    const largestPool = await findLargestPoolForCoin(coin, peggedTo)
    const currentPoolShareInPercent = (
      await getCoinShareOfPool(coin, largestPool)
    ).toFixed(2)

    await createAlertSubscription({
      coin,
      db,
      largestPool: largestPool.id,
      lastKnownPoolShareInPercent: currentPoolShareInPercent,
      peggedTo,
      referenceAsset,
      userId: ctx.session.userId,
    })
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        `✅ Set up peg alert for *${coin}* ${
          getCurrencyEmoji(referenceAsset) ||
          "(tracking " + referenceAsset + ")"
        }`
      )
    )
  } catch (error) {
    debug(
      `[${ctx.session.coin}] ❌ Failed to create alert subscription:`,
      error
    )
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        `❌ Failed to create alert subscription. Internal server error.`
      )
    )
  }

  return await ctx.scene.leave()
}
