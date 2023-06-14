import type { Message } from "telegraf/types"

export default function isTextMessage(
  message: Message | undefined
): message is Message.TextMessage {
  return !!message && "text" in message
}
