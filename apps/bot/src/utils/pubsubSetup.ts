import { PubSub } from "@google-cloud/pubsub"
import debug from "./debug.js"

// Only to be used in local dev environments to configure the pubsub emulator
export default async function pubsubSetup() {
  debug("Pubsub Setup :: START")
  const topicName = process.env["PUBSUB_TOPIC"]
  if (
    topicName == null ||
    topicName == undefined ||
    typeof topicName !== "string"
  ) {
    throw new Error(
      "Missing env var PUBSUB_TOPC. Can't send pubsub messages without a topic."
    )
  }

  const pubsub = createPubsub()
  const topic = pubsub.topic(topicName)

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

  debug("Pubsub Setup :: END")
  return { pubsub, topic }
}

function createPubsub() {
  let pubsub

  if (process.env["NODE_ENV"] === "development") {
    debug("Pubsub Env: DEVELOPMENT")
    pubsub = new PubSub({
      apiEndpoint: "localhost:8085",
      projectId: "curve-pool-tracker",
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
