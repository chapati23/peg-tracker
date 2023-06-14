import getAlertByCoin from "../read/getAlertByCoin.js"
import createAlert from "./createAlert.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function getOrCreateAlert(
  coin: string,
  referenceAsset: string,
  db: Firestore
) {
  try {
    const alert = await getAlertByCoin(coin, db)

    if (alert) {
      return alert
    }

    return await createAlert(coin, referenceAsset, db)
  } catch (error) {
    throw new Error(
      `Failed to get or create alert for '${coin}': ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}
