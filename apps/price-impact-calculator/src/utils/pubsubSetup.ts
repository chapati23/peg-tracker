import { PubSub } from "@google-cloud/pubsub"
import debug from "./debug.js"
import safeEnvVar from "./safeEnvVar.js"

// NOTE: Read about the general approach for connecting to the local pubsub emulator ⬇️
// https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/events.md#using-the-pubsub-emulator

export default async function pubsubSetup() {
  debug("Pubsub Setup :: START")
  const topicName = safeEnvVar(
    "PUBSUB_TOPIC",
    "Can't send pubsub messages without a topic."
  )
  const subName = safeEnvVar(
    "PUBSUB_SUBSCRIPTION",
    "Can't subscribe to pubsub messages without a subscription name."
  )

  const pubsub = createPubsub()
  const topic = pubsub.topic(topicName)
  const sub = pubsub.subscription(subName, { topic })

  const [topicExists] = await topic.exists()
  if (!topicExists) {
    if (pubsub.isEmulator) {
      debug("[EMULATOR] No Pubsub topic found. Creating topic:", topicName)
      await topic.create()
      debug("[EMULATOR] Successfully created topic:", topic.name)
    } else {
      throw new Error(`Couldn't find pubsub topic ${topicName}`)
    }
  }

  const [subExists] = await sub.exists()
  if (!subExists) {
    try {
      debug("[EMULATOR] Subscription not found:", sub.name)
      debug("[EMULATOR] 📡 Creating subscription:", sub.name)
      const port = safeEnvVar(
        "PORT",
        "Can't connect application with local pubsub emulator"
      )
      await sub.create({
        pushEndpoint: `http://localhost:${port}/${topicName}`,
      })
      debug("[EMULATOR}] ✅ Successfully created subscription:", sub.name)
    } catch (error) {
      debug("[EMULATOR] ❌ Failed to create subscription:", error)
    }
  }
}

function createPubsub() {
  let pubsub

  if (process.env["NODE_ENV"] !== "production") {
    debug("Pubsub Env: DEVELOPMENT")
    const projectId = safeEnvVar(
      "PROJECT",
      "Can't connect application with local pubsub emulator"
    )

    pubsub = new PubSub({
      apiEndpoint: "localhost:8085",
      projectId,
    })

    if (!pubsub.isEmulator) {
      throw new Error(
        "Pubsub Emulator not detected. Check if it's up and running"
      )
    }
    debug("[EMULATOR] Using Pubsub emulator")
  } else {
    debug("Pubsub Env: LIVE")
    pubsub = new PubSub()
  }

  return pubsub
}
