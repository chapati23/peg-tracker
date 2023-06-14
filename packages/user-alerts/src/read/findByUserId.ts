import debug from "../utils/debug.js"
import retryFirestoreQueryWithTimeout from "../utils/firestoreRetry.js"
import type { Firestore } from "@google-cloud/firestore"
import type { UserAlert } from "shared-types"

export default async function findAlertSubscriptionsByUserId(
  userId: string,
  db: Firestore
): Promise<UserAlert[] | null> {
  debug(`📡 Fetching alert subscriptions for user ${userId} from DB...`)
  const query = db.collection("user-alerts").where("userId", "==", userId)
  const querySnapshot = await retryFirestoreQueryWithTimeout(query)

  if (querySnapshot && !querySnapshot.empty) {
    // Typecast: If querySnapshot is NOT empty, then querySnapshot.docs[0] should never be
    // undefined. Maybe Firestore types aren't detailed enough for TypeScript to understand this
    // return querySnapshot.docs as unknown as UserAlert[]
    const alertSubscriptions = querySnapshot.docs.map(
      (doc) => doc.data() as UserAlert
    )
    debug(`✅ Found alert subscriptions: ${JSON.stringify(alertSubscriptions)}`)
    return alertSubscriptions
  } else {
    debug(`❌ Did not find any alert subscriptions for user ${userId}`)
    return null
  }
}
