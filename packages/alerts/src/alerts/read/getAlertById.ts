import { Firestore } from "@google-cloud/firestore"
import debug from "../../utils/debug.js"
import type { Alert, AlertWithId } from "shared-types"

export default async function getAlertById(
  alertId: string,
  db?: Firestore
): Promise<AlertWithId | null> {
  try {
    debug(`📡 Fetching alert ${alertId} from DB...`)

    if (!db) {
      db = new Firestore({ preferRest: true })
    }

    const alertDoc = await db.doc(`alerts/${alertId}`).get()

    if (alertDoc.exists) {
      const alert = alertDoc.data() as Alert
      debug(`✅ Found alert: ${JSON.stringify(alert)}`)
      return { ...alert, id: alertId }
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
