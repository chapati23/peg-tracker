import { Firestore } from "@google-cloud/firestore"
import { cloudEvent } from "@google-cloud/functions-framework"
import { getAlertSubscriptionsByUserId } from "alerts"
import { getTopic, isPubSubEvent } from "pubsub"
import { getAllUsers } from "user"
import { safeEnvVar } from "utils"
import debug from "./debug.js"
import type { PubSubEvent } from "shared-types"

/****************** COLD START SECTION ******************/
/* This code can be shared by multiple cloud function
/* instances. Here we define global state and init our API
/* connections so they can be shared across function
/* instances which should speed up overall performance.
/********************************************************/
const db = new Firestore({ preferRest: true })

/****************** CLOUD FUNCTION ******************/
cloudEvent<PubSubEvent>("pegChecker", async (event) => {
  if (!isPubSubEvent(event.data)) {
    debug(event, "❌ Cloud event data is not a valid pubsub msg: ", event.data)
    throw new Error(`Cloud event data is not a valid pubsub msg: ${event.data}`)
  }

  if (!event.source.includes("cron-trigger")) {
    debug(
      event,
      `❌ Exiting. Received event was not of type 'cron-trigger' but: '${event.source}'`
    )
    return
  }

  try {
    const pubsubTopic = safeEnvVar(
      `PUBSUB_TOPIC`,
      "Please define the topic name to publish pubsub messages to"
    )
    // 0. Establish pubsub connection
    const topic = await getTopic(pubsubTopic)

    // 1. Get all users
    const users = await getAllUsers(db)

    // 2. For every user => get their alerts
    for (const userRef of users) {
      debug(event, `📡 Loading alert subscriptions for user ${userRef.id}`)
      const alertSubscriptions = await getAlertSubscriptionsByUserId(
        userRef.id,
        db
      )
      debug(event, `✅ Loaded alert subscriptions for user ${userRef.id}`)

      if (!alertSubscriptions) {
        debug(event, `⚠️ No alert subscriptions found for user ${userRef.id}`)
        return `⚠️ No alert subscriptions found for user ${userRef.id}`
      }

      // 3. For every alert => trigger a price impact calculation background job via PubSub
      for (const sub of alertSubscriptions) {
        debug(
          event,
          `[${userRef.id}] 📡 Triggering price impact calculation for ${sub.alertId}...`
        )
        await topic.publishMessage({
          data: Buffer.from(sub.alertId),
          attributes: { userId: userRef.id },
        })
        debug(
          event,
          `[${userRef.id}] ✅ Triggered price impact calculation for ${sub.alertId}`
        )
      }
    }
    debug(event, "✅ Successfully checked all peg alerts")

    return "✅ Successfully checked all peg alerts"
  } catch (error) {
    debug(event, "❌ UNEXPECTED ERROR", error)
    throw new Error(`❌ Unexpected Error while checking peg alerts ${error}`)
  }
})
