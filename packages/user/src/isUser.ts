import type { User } from "shared-types"

export default function isUser(obj: unknown): obj is User {
  if (typeof obj !== "object" || obj === null) {
    return false
  }

  const _obj = obj as Record<string, unknown>

  return (
    (typeof _obj["type"] === "string" &&
      typeof _obj["username"] === "string" &&
      Array.isArray(_obj["pegAlerts"])) ||
    _obj["pegAlerts"] == null
  )
}
