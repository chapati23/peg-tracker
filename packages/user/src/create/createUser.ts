import debug from "../utils/debug.js"
import type { Firestore } from "@google-cloud/firestore"
import type { Chat } from "shared-types"

export default async function createUser(
  userId: number,
  chat: Chat,
  db: Firestore
) {
  try {
    debug("🌀 Creating new user...")
    const userRef = db.doc(`users/${userId}`)
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
    return userRef
  } catch (error) {
    debug(`❌ Failed to create new user for ${userId}`)
    throw error
  }
}
