import { createAlertSubscription, alertSubscriptionExists } from "alerts"
import {
  definePegAsset,
  findLargestPoolForCoin,
  getCoinShareOfPool,
  getPoolsForCoin,
  getReferenceAsset,
  getSupportedCoins,
} from "curve"
import { Markup } from "telegraf"
import { escapeMarkdown } from "telegram"
import { db } from "../../index.js"
import debug from "../../utils/debug.js"
import getCurrencyEmoji from "../../utils/getCurrencyEmoji.js"
import isTextMessage from "../../utils/isTextMessage.js"
import { supportedCommands } from "../help.js"
import type { CustomContext } from "../../types.js"
import type { Message } from "telegraf/types"

export default async function step2FindCoin(ctx: CustomContext) {
  debug(ctx, `AddAlert :: Step 2 :: Find Coin`)

  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  const userInput = ctx.message.text

  // If user first wants to see all supported coins
  if (userInput === "/coins") {
    // Display supported coins and then re-run the current step to allow user to enter supported coin
    return runCoinsCommand(ctx)
  }

  const shorthandTicker = userInput.split(" ")[1]
  const coin =
    typeof shorthandTicker === "string"
      ? // If user used shorthand `/add DAI`
        shorthandTicker.toUpperCase()
      : // Else use normal user input which should have been just a tickername, i.e. `DAI`
        (ctx.message as Message.TextMessage).text.toUpperCase() // We're checking the type of ctx.message in the isTextMessage middleware which TS isn't smart enough to pick up

  // Store coin in session so it's accessible by the next wizard steps
  ctx.session.coin = coin

  if (!(await getSupportedCoins()).includes(coin.toLowerCase())) {
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        `Sorry, *${coin}* is not supported. Enter another ticker or */cancel*\n\nYou can view a list of all supported coins with */coins*`
      )
    )
    // Re-run the current step to allow user to enter supported coin
    return
  }

  if (await alertSubscriptionExists(ctx.session.userId, coin, db)) {
    ctx.replyWithMarkdownV2(
      escapeMarkdown(
        `ℹ️ You already have an alert set up for *${coin}*. You're all set.`
      )
    )

    return await ctx.scene.leave()
  }

  await ctx.replyWithMarkdownV2(
    escapeMarkdown(`⏳ Setting up peg alert for *${coin}*...`)
  )

  const pools = getPoolsForCoin(coin)
  if (!pools || pools.length === 0) {
    // NOTE: We should never land in here. Still better to explicitly handle worst case scenario than crashing

    debug(
      ctx,
      `❌ No curve pools found for ${coin}. This should never happen because we're checking if the entered coin is in the supported coins list earlier 🤔`
    )
    await ctx.reply(
      `❌ No curve pools found for ${coin}. We don't support this coin yet.`
    )
    return // Re-run the current step to allow user to enter supported coin
  }

  const referenceAsset = getReferenceAsset(coin, pools)
  if (typeof referenceAsset === "string") {
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
  } else if (typeof referenceAsset === "object") {
    /* If multiple reference assets are found, let the user pick the right one.
     * This can happen in the rare case when there's an equal no. of stableswap
     * as well as crypto pools containing the asset. For example, if there was 1 [FRAX/USDC]
     * pool with USD as the reference asset, and 1 [FRAX/ETH] pool with CRYPTO as the
     * reference asset.
     */
    const referenceAssets = Object.keys(referenceAsset)
    const referenceAssetsNumberedList = referenceAssets
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n")
    debug(ctx, `Reference assets:`, referenceAssets)

    const buttons = Markup.inlineKeyboard([
      referenceAssets.map((option) => Markup.button.callback(option, option)),
    ])
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        `*Which coin should act as the peg reference for ${coin}?*\n\n${referenceAssetsNumberedList}\n\n_💡 FYI: For most coins we can determine the right peg automatically. But for smaller coins that have multiple pools on Curve this isn't always possible._`
      ),
      buttons
    )

    return ctx.wizard.next()
  } else {
    throw new Error(
      `❌ Unable to determine reference asset for ${coin}. Reference asset is ${referenceAsset}`
    )
  }

  return await ctx.scene.leave()
}

async function runCoinsCommand(ctx: CustomContext) {
  const coinsCommand = supportedCommands.find((c) => c.name === "coins")

  if (coinsCommand) {
    await coinsCommand.command(ctx)
  } else {
    throw new Error("/coins command not found in supported commands")
  }
}
