import { escapeMarkdown } from "telegram"
import debug from "../../utils/debug.js"
import isTextMessage from "../../utils/isTextMessage.js"
import step2FindCoin from "./step2FindCoin.js"
import type { CustomContext } from "../../types.js"

export default async function step1AskForTicker(ctx: CustomContext) {
  debug("[AddAlert :: Step 1 :: Ask for ticker symbol]")

  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  // Store userId in session so it's accessible by the next wizard steps
  ctx.session.userId = ctx.message.from.id.toString()

  if (!ctx.session.userId)
    throw new Error("Couldn't determine user ID from context")

  // If user already passed a ticker with `/add DAI`, skip ahead to the next step
  if (ctx.message.text.split(" ")[1]) {
    ctx.wizard.next()
    return await step2FindCoin(ctx)
  } else {
    // If user just used `/add`, ask for ticker input
    await ctx.replyWithMarkdownV2(
      escapeMarkdown(
        "*Which coin's peg would you like to monitor?*\n\nEnter a ticker symbol like *USDT*\n\nOr see all supported coins with */coins*"
      )
    )

    return ctx.wizard.next()
  }
}
