import type { UserAlert } from "shared-types"

export default function isAlert(obj: unknown): obj is UserAlert {
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
