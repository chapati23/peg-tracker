export * from "./data-model"

export interface PriceImpact {
  swapAmount: number
  priceImpact: number
}

export type TelegramApiResponse<T> =
  | { ok: true; result: T }
  | { ok: false; error_code: number; description: string }

export type Chat = {
  id: number
  type: "private" | "group" | "supergroup" | "channel"
  title?: string
  username?: string
}

export interface PubSubEvent {
  subscription?: string
  message: {
    messageId: string
    publishTime: string
    data: string
    attributes?: { [key: string]: string }
  }
}
