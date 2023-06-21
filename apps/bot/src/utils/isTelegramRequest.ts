import { IncomingMessage } from "http"
import type { Request } from "@google-cloud/functions-framework"
import type { Update, Message, CallbackQuery } from "telegraf/types"

export default function isTelegramRequest(
  req: unknown
): req is Request & { body: Update } {
  if (!(req instanceof IncomingMessage) || !("body" in req)) {
    return false
  }

  const { body } = req

  if (typeof body !== "object" || body === null) {
    return false
  }

  if ("message" in body) {
    const message = body.message as Message
    return (
      typeof message === "object" &&
      message !== null &&
      "message_id" in message &&
      "from" in message &&
      "chat" in message &&
      "date" in message
    )
  }

  if ("callback_query" in body) {
    const callbackQuery = body.callback_query as CallbackQuery
    return (
      typeof callbackQuery === "object" &&
      callbackQuery !== null &&
      "id" in callbackQuery &&
      "from" in callbackQuery &&
      "message" in callbackQuery &&
      "chat_instance" in callbackQuery
    )
  }

  return false
}
