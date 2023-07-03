/* eslint-disable no-console */
/* eslint-disable import/no-unused-modules */
import * as readline from "readline"
import { Firestore } from "@google-cloud/firestore"
import { safeEnvVar } from "utils"

const userId = safeEnvVar("TG_USER_ID")
const userName = safeEnvVar("TG_USERNAME")

const USER_MOCK = {
  id: userId,
  username: userName,
  type: "private",
}

// Initialize Firestore client
const db = new Firestore({ preferRest: true })

// Define the data model and create collections
async function createDataModel() {
  try {
    // Check if collections already exist
    const users = db.collection("users")
    const alerts = db.collection("alerts")
    const alertSubscriptions = db.collection("alertSubscriptions")

    const [
      userCollectionExists,
      alertCollectionExists,
      alertSubscriptionsCollectionExists,
    ] = await Promise.all([
      collectionExists(users),
      collectionExists(alerts),
      collectionExists(alertSubscriptions),
    ])

    // Prompt for confirmation if collections already exist
    if (
      userCollectionExists ||
      alertCollectionExists ||
      alertSubscriptionsCollectionExists
    ) {
      const confirmation = await confirmDeleteCollections()
      if (confirmation !== "YES") {
        console.log("Aborted. Existing collections were not deleted.")
        return
      }
    }

    await users.doc(USER_MOCK.id).set({
      username: USER_MOCK.username,
      type: USER_MOCK.type,
    })

    const alertDocRef = await alerts.add({
      coin: "MIM",
      peggedTo: "USDC",
      referenceAsset: "USD",
      lastKnownPoolShareInPercent: "0",
    })
    const alertId = alertDocRef.id

    await alertSubscriptions.add({
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
