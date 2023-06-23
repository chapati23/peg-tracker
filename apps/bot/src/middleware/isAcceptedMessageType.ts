import debug from "../utils/debug.js"
import isCallback from "../utils/isCallback.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { CustomContext } from "../types.js"

// Checks if user input is a text or callback response.
// Cancel if user replies with images, voice messages etc.
export default async function isAcceptedMessageTypeMiddleware(
  ctx: CustomContext,
  next: () => Promise<void>
) {
  debug("[Middleware :: isTextMessage :: START")
  if (!isTextMessage(ctx.message) && !isCallback(ctx.update)) {
    debug(
      "User didn't reply with accepted message type, re-running same wizard step",
      ctx
    )
    debug("[Middleware :: isTextMessage :: EXIT")

    await ctx.reply(
      "Sorry, I can't handle this message type. Please try again."
    )

    // Re-run the current step
    return
  }

  debug("[Middleware :: isTextMessage :: CONTINUE")
  await next() // Continue to the next step or middleware
}
