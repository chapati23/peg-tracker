import debug from "../utils/debug.js"
import type { Firestore } from "@google-cloud/firestore"
import type { User } from "shared-types"

export default async function getUserById(
  userId: number,
  db: Firestore
): Promise<User | undefined> {
  debug(`\n🌀 Looking up user '${userId} in Firestore...`)
  const userRef = db.doc(`users/${userId}`)
  const userSnapshot = await userRef.get()

  if (userSnapshot.exists) {
    debug("👤 USER INFO", JSON.stringify(userSnapshot.data(), null, 4), "\n")
    debug(`✅ Loaded existing user with ID '${userId}'`)

    return userSnapshot.data() as User
  }

  debug(`⚠️ No user with chat ID '${userId}' found in DB`)
  return undefined
}
