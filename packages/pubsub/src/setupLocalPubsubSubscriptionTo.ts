import { safeEnvVar } from "utils"
import createPubsub from "./createPubsub.js"
import debug from "./debug.js"
import getTopic from "./getTopic.js"

export default async function setupLocalPubsubSubscriptionTo(
  topicName: string
) {
  debug("[PUBSUB] 📡 Setting up local pubsub subscription to", topicName)
  const subName = safeEnvVar(
    "PUBSUB_SUBSCRIPTION",
    "Can't subscribe to pubsub messages without a subscription name."
  )
  const port = safeEnvVar(
    "PORT",
    "Can't connect application with local pubsub emulator"
  )

  const pubsub = createPubsub()
  const topic = await getTopic(topicName)
  const subscription = pubsub.subscription(subName, { topic })

  const [subExists] = await subscription.exists()
  if (!subExists) {
    try {
      debug(
        `[PUBSUB] 📡 Didn't find subscription ${subscription.name}. Creating...`
      )
      await subscription.create({
        pushEndpoint: `http://localhost:${port}/${topicName}`,
      })
      debug("[PUBSUB] ✅ Successfully created subscription:", subscription.name)
    } catch (error) {
      debug("[PUBSUB] ❌ Failed to create subscription:", error)
    }
  }

  debug("[PUBSUB] ✅ Set up local pubsub subscription to", topicName)
}
