import { safeEnvVar } from "utils"
import debug from "./utils/debug.js"
import request from "./utils/request.js"
import type { TelegramApiResponse } from "shared-types"

type Response = boolean

export default async function sendChatAction(
  // hardcoded for now but could be extended to accept other actions from https://core.telegram.org/bots/api#sendchataction
  action: "typing",
  chatId: string
): Promise<Response> {
  debug(`\n🌀 Sending 'typing...' update to Telegram chat: ${chatId}`)
  const botToken = safeEnvVar("TELEGRAM_BOT_TOKEN")

  let response

  try {
    response = await request<TelegramApiResponse<Response>>(
      `https://api.telegram.org/bot${botToken}/sendChatAction`,
      {
        chat_id: chatId,
        action,
      }
    )

    debug(
      `✅ Successfully sent 'typing...' update to Telegram chat '${chatId}'`
    )
  } catch (error) {
    debug(`❌ Unexpected Error sending chat action to '${chatId}'`, error)
    throw error
  }

  if (response.ok) {
    return response.result
  } else {
    throw new Error(`Bad API response while sending chat action: ${response}`)
  }
}
