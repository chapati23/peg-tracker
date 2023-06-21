import getAlertByCoin from "../read/getAlertByCoin.js"
import createAlert from "./createAlert.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function getOrCreateAlert(options: {
  coin: string
  db: Firestore
  largestPool: string
  lastKnownPoolShareInPercent: string
  peggedTo: string
  referenceAsset: string
}) {
  try {
    const {
      coin,
      db,
      largestPool,
      lastKnownPoolShareInPercent,
      peggedTo,
      referenceAsset,
    } = options
    const alert = await getAlertByCoin(coin, db)

    if (alert) {
      return alert
    }

    return await createAlert({
      coin,
      db,
      largestPool,
      lastKnownPoolShareInPercent,
      peggedTo,
      referenceAsset,
    })
  } catch (error) {
    throw new Error(
      `Failed to get or create alert for '${options.coin}': ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}
