import debug from "../utils/debug.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function deleteAlertSubscriptionById(
  id: string,
  db: Firestore
) {
  try {
    debug(`💾 Deleting alert subscription ${id}...`)
    await db.collection("user-alerts").doc(id).delete()
    debug(`✅ Deleted alert subscription ${id}`)
  } catch (error) {
    throw new Error(
      `Failed to delete alert subscription ${id}: ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}
