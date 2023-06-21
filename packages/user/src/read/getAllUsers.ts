import debug from "../utils/debug.js"
import type {
  Firestore,
  DocumentReference,
  DocumentData,
} from "@google-cloud/firestore"

export default async function getAllUsers(
  db: Firestore
): Promise<DocumentReference<DocumentData>[]> {
  debug(`\n🌀 Fetching all users from Firestore...`)

  return await db.collection(`users`).listDocuments()
}
