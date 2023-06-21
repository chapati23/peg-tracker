import type { Firestore } from "@google-cloud/firestore"

export default async function getAlertSubscriptionByUserIdAndAlertId(
  userId: string,
  alertId: string,
  db: Firestore
) {
  let querySnapshot
  try {
    // Check if the alert already exists for the given coin
    querySnapshot = await db
      .collection("alertSubscriptions")
      .where("userId", "==", userId)
      .where("alertId", "==", alertId)
      .get()
  } catch (error) {
    throw new Error(
      `Failed to query alert subscription for userId ${userId} and alertId ${alertId} from DB: ${
        error instanceof Error ? error.message : error
      }`
    )
  }

  if (querySnapshot.empty) {
    return null
  } else if (querySnapshot.size > 1) {
    throw new Error(
      `More than 1 alert subscription found for userId ${userId} and alertId ${alertId}. Check DB for data inconsistencies.`
    )
  } else {
    return querySnapshot.docs[0]
  }
}
