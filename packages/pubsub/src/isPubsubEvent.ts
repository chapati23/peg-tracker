import debug from "./debug.js"
import type { PubSubEvent } from "shared-types"

export default function isPubSubEvent(obj: unknown): obj is PubSubEvent {
  if (typeof obj !== "object" || obj === null) {
    return false
  }

  const requiredProperties = ["message"]
  const optionalProperties = ["messageId", "publishTime", "data", "attributes"]

  for (const prop of requiredProperties) {
    if (!(prop in obj)) {
      debug(`Missing ${prop} in `, obj)
      return false
    }
  }

  for (const prop of optionalProperties) {
    if (
      "message" in obj &&
      obj.message !== null &&
      typeof obj.message === "object" &&
      !(prop in obj.message)
    ) {
      debug(`Missing ${prop} in `, obj.message)
      return false
    }
  }

  return true
}
