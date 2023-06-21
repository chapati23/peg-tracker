import debug from "./debug.js"
import type {
  Query,
  DocumentData,
  QuerySnapshot,
} from "@google-cloud/firestore"

export default async function retryFirestoreQueryWithTimeout(
  query: Query<DocumentData>,
  timeout = 20000, // Default timeout is 5 seconds
  maxRetries = 3 // Default maximum number of retries is 3
): Promise<QuerySnapshot<DocumentData> | void> {
  let retries = 1

  while (retries <= maxRetries) {
    debug(`📡 Firestore query attempt: ${retries}/${maxRetries}`)
    try {
      const queryPromise = query.get()
      const timeoutPromise = new Promise<void>((_resolve, reject) => {
        setTimeout(() => {
          reject(`Attempt ${retries}/${maxRetries} failed`)
        }, timeout)
      })

      return await Promise.race([queryPromise, timeoutPromise])
        .then((querySnapshot) => {
          debug("✅ Firestore query successful")
          return querySnapshot
        })
        .catch((err) => {
          debug("⚠️  Firestore query timed out:", err)
          throw err
        })
    } catch (error) {
      debug(`Retrying Firestore query...`)
      retries++
    }
  }

  throw new Error(`Firestore query failed after ${maxRetries} attempts`)
}
