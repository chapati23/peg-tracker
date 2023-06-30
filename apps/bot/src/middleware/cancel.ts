import debug from "../utils/debug.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { CustomContext } from "../types.js"

// Checks if user signalled intent to cancel the current flow via trigger words
// such as 'cancel', 'stop', or '/cancel'
export default async function cancelMiddleware(
  ctx: CustomContext,
  next: () => Promise<void>
) {
  debug(ctx, "[Middleware :: Cancel :: START]")

  if (isTextMessage(ctx.message)) {
    const userInputWithoutSlash = ctx.message.text
      .toLowerCase()
      .replace("/", "")

    const exitWords = ["cancel", "exit", "leave", "stop"]
    if (exitWords.includes(userInputWithoutSlash)) {
      await ctx.reply("🔙 Cancelled. Back to main menu")
      debug(ctx, "[Middleware :: Cancel :: EXIT]")
      return await ctx.scene.leave()
    }
  }

  debug(ctx, "[Middleware :: Cancel :: CONTINUE]")
  await next() // Continue to the next step or middleware
}
