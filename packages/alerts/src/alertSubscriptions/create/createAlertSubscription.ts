import getOrCreateAlert from "../../alerts/create/getOrCreateAlert.js"
import debug from "../../utils/debug.js"
import isAlertSubscription from "../isAlertSubscription.js"
import type { Firestore } from "@google-cloud/firestore"
import type { AlertSubscription } from "shared-types"

export default async function createAlertSubscription(options: {
  coin: string | undefined
  db: Firestore
  largestPool: string
  lastKnownPoolShareInPercent: string
  peggedTo: string
  referenceAsset: string | undefined
  userId: string | undefined
}) {
  const {
    coin,
    db,
    largestPool,
    lastKnownPoolShareInPercent,
    peggedTo,
    referenceAsset,
    userId,
  } = options

  debug(`[${coin}] 💾 Creating new alert subscription for user ${userId}...`)

  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId. Please provide a valid number.")
  }

  if (!coin || typeof coin !== "string") {
    throw new Error("Invalid coin. Please provide a valid string.")
  }

  if (!referenceAsset || typeof referenceAsset !== "string") {
    throw new Error("Invalid referenceAsset. Please provide a valid string.")
  }

  const alert = await getOrCreateAlert({
    coin,
    db,
    largestPool,
    lastKnownPoolShareInPercent,
    peggedTo,
    referenceAsset,
  })

  try {
    await addAlertSubscriptionToFirestore(
      {
        userId,
        alertId: alert.id,
        poolShareThresholdInPercent: 60,
      },
      db
    )
    debug(`[${coin}] ✅ Created alert subscription for user ${userId}`)
  } catch (error) {
    throw new Error(
      `Failed to subscribe user ${userId} to alert ${alert.id}: ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}

async function addAlertSubscriptionToFirestore(
  alertSubscription: AlertSubscription,
  db: Firestore
): Promise<
  FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
> {
  if (!isAlertSubscription(alertSubscription)) {
    throw new Error(
      `Couldn't add alert subscription to DB. Invalid data structure: ${alertSubscription}`
    )
  }

  return await db.collection("alertSubscriptions").add(alertSubscription)
}
