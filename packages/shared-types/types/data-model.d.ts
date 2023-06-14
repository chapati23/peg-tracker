export type User = {
  username: string
  type: "private" | "group" | "supergroup" | "channel"
  /** In case of group|supergroup|channel */
  title?: string
}

export type UserWithId = User & { id: string }

export type Alert = {
  coin: string
  peggedTo: string
  referenceAsset: string
  lastKnownPoolShareInPercent: string
}

export type AlertWithId = Alert & { id: string }

// Join table managing the Users <=> Alerts relationship
export type UserAlert = {
  userId: string
  alertId: string
  poolShareThresholdInPercent: number
}
