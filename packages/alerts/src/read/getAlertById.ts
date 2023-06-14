import debug from "../utils/debug.js"
import type { Firestore } from "@google-cloud/firestore"
import type { Alert } from "shared-types"

export default async function getAlertById(
  alertId: string,
  db: Firestore
): Promise<Alert | null> {
  try {
    debug(`📡 Fetching alert ${alertId} from DB...`)
    const alertDoc = await db.doc(`alerts/${alertId}`).get()

    if (alertDoc.exists) {
      const alert = alertDoc.data() as Alert
      debug(`✅ Found alert: ${JSON.stringify(alert)}`)
      return alert
    } else {
      debug(
        `❌ Could not find alert with ID ${alertId}. alertDoc was:`,
        alertDoc
      )
      return null
    }
  } catch (error) {
    throw new Error(
      `Failed to get alert ${alertId}: ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}
