import type { Firestore } from "@google-cloud/firestore"
import type { AlertWithId } from "shared-types"

export default async function getAlertsForUser(userId: string, db: Firestore) {
  const userAlertsData = await db
    .collection("users")
    .doc(userId)
    .collection("alerts")
    .get()

  return userAlertsData.docs.map((doc) => doc.data() as AlertWithId)
}
