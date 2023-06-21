import debug from "../utils/debug.js"
import isCallback from "../utils/isCallback.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { Context } from "telegraf"
import type {
  SceneContextScene,
  WizardContextWizard,
  WizardSessionData,
} from "telegraf/scenes"

// Checks if user input is a text or callback response.
// Cancel if user replies with images, voice messages etc.
export default async function isAcceptedMessageTypeMiddleware<
  TContext extends Context & {
    scene: SceneContextScene<TContext, WizardSessionData>
    wizard: WizardContextWizard<TContext>
  }
>(ctx: TContext, next: () => Promise<void>) {
  debug("[Middleware :: isTextMessage :: START")
  if (!isTextMessage(ctx.message) && !isCallback(ctx.update)) {
    debug(
      "User didn't reply with accepted message type, re-running same wizard step",
      ctx
    )
    await ctx.reply(
      "Sorry, I can't handle this message type. Please try again."
    )
    ctx.wizard.selectStep(ctx.wizard.cursor) // Re-run the current step
  } else {
    debug("[Middleware :: isTextMessage :: END")
    await next() // Continue to the next step or middleware
  }
}
