import { findLargestPoolForCoin, getCoinShareOfPool } from "curve"
import { Alert, AlertWithId } from "shared-types"
import debug from "../utils/debug.js"
import definePegAsset from "../utils/definePegAsset.js"
import isAlert from "../utils/isAlert.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function createAlert(
  coin: string,
  referenceAsset: string,
  db: Firestore
): Promise<AlertWithId> {
  try {
    debug(`💾️ Creating new alert for ${coin} in DB...`)
    const peggedTo = definePegAsset(referenceAsset)
    const pool = await findLargestPoolForCoin(coin, peggedTo)
    const currentPoolShareInPercent = (
      await getCoinShareOfPool(coin, pool)
    ).toFixed(2)

    const newAlert = await addAlert(
      {
        coin,
        referenceAsset,
        peggedTo,
        lastKnownPoolShareInPercent: currentPoolShareInPercent,
      },
      db
    )

    debug(`✅ Successfully created new alert for ${coin}`)

    return newAlert as unknown as AlertWithId
  } catch (error) {
    throw new Error(
      `Failed to create an alert: ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}

async function addAlert(
  alert: Alert,
  db: Firestore
): Promise<
  FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
> {
  if (!isAlert(alert)) {
    throw new Error(
      `Couldn't add alert to DB. Invalid data structure: ${alert}`
    )
  }

  return await db.collection("alerts").add(alert)
}
