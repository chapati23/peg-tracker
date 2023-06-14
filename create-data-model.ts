/* eslint-disable no-console */
/* eslint-disable import/no-unused-modules */
import * as readline from "readline"
import { Firestore } from "@google-cloud/firestore"

if (typeof process.env["TG_USER_ID"] !== "string") {
  throw new Error("Missing env var TG_USER_ID")
}

if (typeof process.env["TG_USERNAME"] !== "string") {
  throw new Error("Missing env var TG_USERNAME")
}

const USER_MOCK = {
  id: process.env["TG_USER_ID"],
  username: process.env["TG_USERNAME"],
  type: "private",
}

// Initialize Firestore client
const db = new Firestore({ preferRest: true })

// Define the data model and create collections
async function createDataModel() {
  try {
    // Check if collections already exist
    const usersCollection = db.collection("users")
    const alertsCollection = db.collection("alerts")
    const userAlertsCollection = db.collection("user-alerts")

    const [
      userCollectionExists,
      alertCollectionExists,
      userAlertsCollectionExists,
    ] = await Promise.all([
      collectionExists(usersCollection),
      collectionExists(alertsCollection),
      collectionExists(userAlertsCollection),
    ])

    // Prompt for confirmation if collections already exist
    if (
      userCollectionExists ||
      alertCollectionExists ||
      userAlertsCollectionExists
    ) {
      const confirmation = await confirmDeleteCollections()
      if (confirmation !== "YES") {
        console.log("Aborted. Existing collections were not deleted.")
        return
      }
    }

    await usersCollection.doc(USER_MOCK.id).set({
      username: USER_MOCK.username,
      type: USER_MOCK.type,
    })

    const alertDocRef = await alertsCollection.add({
      coin: "MIM",
      peggedTo: "USDC",
      referenceAsset: "USD",
      lastKnownPoolShareInPercent: "0",
    })
    const alertId = alertDocRef.id

    await userAlertsCollection.add({
      userId: USER_MOCK.id,
      alertId,
      poolShareThresholdInPercent: 60,
    })

    console.log("Data model created successfully!")
  } catch (error) {
    console.error("Error creating data model:", error)
  }
}

// Check if a collection already exists
async function collectionExists(
  collection: FirebaseFirestore.CollectionReference
) {
  const snapshot = await collection.limit(1).get()
  return !snapshot.empty
}

// Prompt for confirmation to delete existing collections
async function confirmDeleteCollections() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<string>((resolve) => {
    rl.question(
      'Existing collections found. Do you want to delete them? Type "YES" to confirm: ',
      (answer) => {
        rl.close()
        resolve(answer)
      }
    )
  })
}

// Call the function to create the data model
createDataModel()
