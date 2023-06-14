import type { Alert } from "shared-types"

export default function isAlert(obj: unknown): obj is Alert {
  if (typeof obj !== "object" || obj === null) {
    return false
  }

  const _obj = obj as Record<string, unknown>

  return (
    typeof _obj["coin"] === "string" &&
    typeof _obj["referenceAsset"] === "string" &&
    typeof _obj["peggedTo"] === "string" &&
    typeof _obj["lastKnownPoolShareInPercent"] === "string"
  )
}
