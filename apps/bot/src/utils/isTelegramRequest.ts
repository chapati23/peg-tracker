import { IncomingMessage } from "http"
import type { Request } from "@google-cloud/functions-framework"
import type { Update } from "telegraf/types"

export default function isTelegramRequest(
  req: unknown
): req is Request & { body: Update } {
  if (!(req instanceof IncomingMessage) || !("body" in req)) {
    return false
  }

  const { body } = req

  if (body === null || typeof body !== "object" || !("message" in body)) {
    return false
  }

  const message = body.message

  // For readability, the verbose version is actually better than a one-liner return
  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (
    !message ||
    typeof message !== "object" ||
    !("message_id" in message) ||
    !("from" in message) ||
    !("chat" in message) ||
    !("date" in message)
  ) {
    return false
  }

  return true
}
