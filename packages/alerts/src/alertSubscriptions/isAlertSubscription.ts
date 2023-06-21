import type { AlertSubscription } from "shared-types"

export default function isAlert(obj: unknown): obj is AlertSubscription {
  if (typeof obj !== "object" || obj === null) {
    return false
  }

  const _obj = obj as Record<string, unknown>

  return (
    typeof _obj["alertId"] === "string" &&
    typeof _obj["userId"] === "string" &&
    typeof _obj["poolShareThresholdInPercent"] === "number"
  )
}
