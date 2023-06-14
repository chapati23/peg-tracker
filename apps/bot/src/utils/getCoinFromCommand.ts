import isTextMessage from "./isTextMessage.js"
import type { CustomContext } from "../types.js"

export default function getCoinFromCommand(ctx: CustomContext) {
  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message doesn't seem to be a text message but instead was: ${ctx.message}`
    )
  }

  const coin = ctx.message?.text.split("_")[1]

  if (!coin || typeof coin !== "string") {
    throw new Error(`Couldn't extract coin from '${ctx.message.text}' command`)
  }

  return coin
}
