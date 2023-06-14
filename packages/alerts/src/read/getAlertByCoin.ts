import { AlertWithId } from "shared-types"
import debug from "../utils/debug.js"
import isAlert from "../utils/isAlert.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function getAlertByCoin(
  coin: string,
  db: Firestore
): Promise<AlertWithId | undefined> {
  debug(`💾 Fetching alert for ${coin} from DB...`)
  try {
    // Check if the alert already exists for the given coin
    const querySnapshot = await db
      .collection("alerts")
      .where("coin", "==", coin)
      .get()

    // Return undefined if no alert was found and leave error handling to consuming functions
    if (querySnapshot.empty) {
      debug(`⚠️ Couldn't find alert for ${coin}`)

      return
    }

    const alertDoc = querySnapshot.docs[0]
    const alert = alertDoc?.data()

    if (!alertDoc || !isAlert(alert)) {
      throw new Error(
        `Alert for ${coin} had unexpected data shape: ${JSON.stringify(
          alert,
          null,
          2
        )}`
      )
    }

    debug("✅ Fetched alert:", alert)

    return { id: alertDoc.id, ...alert }
  } catch (error) {
    throw new Error(
      `Failed to get alert ID: ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}
