import debug from "../../utils/debug.js"
import isAlert from "../isAlert.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function createAlert(options: {
  coin: string
  db: Firestore
  largestPool: string
  lastKnownPoolShareInPercent: string
  peggedTo: string
  referenceAsset: string
}): Promise<
  FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
> {
  try {
    const {
      coin,
      db,
      largestPool,
      lastKnownPoolShareInPercent,
      peggedTo,
      referenceAsset,
    } = options
    debug(`[${coin}] 💾️ Creating new alert in DB...`)

    const alert = {
      coin,
      referenceAsset,
      peggedTo,
      lastKnownPoolShareInPercent,
    }
    if (!isAlert(alert)) {
      throw new Error(
        `Couldn't add alert to DB. Invalid data structure: ${alert}`
      )
    }

    const alertRef = db.doc(
      `alerts/${coin}-to-${referenceAsset}-via-${peggedTo}`
    )
    await alertRef.set({
      coin,
      largestPool,
      lastKnownPoolShareInPercent,
      peggedTo,
      referenceAsset,
    })

    debug(`[${coin}] ✅ Successfully created alert`)

    return alertRef
  } catch (error) {
    throw new Error(
      `Failed to create an alert: ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}
