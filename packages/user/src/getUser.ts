import debug from "./utils/debug.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function getUser(
  userId: number,
  db: Firestore
): Promise<
  FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
> {
  debug(`\n🌀 Looking up user '${userId} in Firestore...`)
  const userRef = db.doc(`users/${userId}`)
  const userSnapshot = await userRef.get()

  if (userSnapshot.exists) {
    debug(`✅ Found existing user with ID '${userId}'`)
    debug("👤 USER INFO", JSON.stringify(userSnapshot.data(), null, 4), "\n")
    debug(`✅ Loaded existing user with ID '${userId}'`)

    return userRef
  }

  throw new Error(`⚠️ No user with chat ID '${userId}' found in DB`)
}
