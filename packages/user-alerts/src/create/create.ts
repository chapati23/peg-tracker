import { getOrCreateAlert } from "alerts"
import { UserAlert } from "shared-types"
import debug from "../utils/debug.js"
import isUserAlert from "../utils/isUserAlert.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function createAlertSubscription(
  userId: string | undefined,
  coin: string | undefined,
  referenceAsset: string | undefined,
  db: Firestore
) {
  debug(`💾 Creating new alert subscription for ${coin} for user ${userId}...`)

  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId. Please provide a valid number.")
  }

  if (!coin || typeof coin !== "string") {
    throw new Error("Invalid coin. Please provide a valid string.")
  }

  if (!referenceAsset || typeof referenceAsset !== "string") {
    throw new Error("Invalid referenceAsset. Please provide a valid string.")
  }

  const alert = await getOrCreateAlert(coin, referenceAsset, db)

  try {
    await addAlertSubscriptionToFirestore(
      {
        userId,
        alertId: alert.id,
        poolShareThresholdInPercent: 60,
      },
      db
    )
    debug(`✅ Created alert subscription for ${coin} for user ${userId}`)
  } catch (error) {
    throw new Error(
      `Failed to subscribe user ${userId} to alert ${alert.id}: ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}

async function addAlertSubscriptionToFirestore(
  alertSubscription: UserAlert,
  db: Firestore
): Promise<
  FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
> {
  if (!isUserAlert(alertSubscription)) {
    throw new Error(
      `Couldn't add alert subscription to DB. Invalid data structure: ${alertSubscription}`
    )
  }

  return await db.collection("user-alerts").add(alertSubscription)
}
