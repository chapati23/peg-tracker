import { getChat } from "telegram"
import debug from "./utils/debug.js"
import type { Firestore } from "@google-cloud/firestore"
import type { User } from "shared-types"

export default async function getOrCreateUser(
  userId: number,
  db: Firestore
): Promise<User> {
  debug(`\n🌀 Looking up user '${userId} in Firestore...`)
  const userRef = db.doc(`users/${userId}`)
  let userSnapshot = await userRef.get()

  // Load existing user
  // OR create new user if we don't have a user record for a given telegram chat ID
  if (userSnapshot.exists) {
    debug(`✅ Loaded existing user with ID '${userId}'`)
    userSnapshot = await userRef.get()
  } else {
    userSnapshot = await createUser(userId, userRef)
  }

  const user = userSnapshot.data() as User

  debug("👤 USER INFO", JSON.stringify(user, null, 4), "\n")

  return user
}

async function createUser(
  userId: number,
  userRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
) {
  debug("New user detected! Fetching chat details from Telegram...")
  const chat = await getChat(userId)
  debug("Chat details:", chat)

  if (chat.type === "private") {
    await userRef.set({
      type: chat.type,
      username: chat.username,
    })
  } else if (chat.type === "channel") {
    await userRef.set({
      type: chat.type,
      title: chat.title,
    })
  } else if (chat.type === "group" || chat.type === "supergroup") {
    throw new Error(
      "No support for groups or supergroups yet, let me know if you want this"
    )
  }

  debug(`✅ Created new user with ID '${userId}'`)
  return await userRef.get()
}
