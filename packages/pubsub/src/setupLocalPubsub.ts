import { safeEnvVar } from "utils"
import createPubsub from "./createPubsub.js"
import debug from "./debug.js"

// NOTE: Read about the general approach for connecting to the local pubsub emulator ⬇️
// https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/events.md#using-the-pubsub-emulator

// eslint-disable-next-line import/no-unused-modules
export default async function setupPubsubEmulator() {
  debug("[PUBSUB] Emulator Setup :: START")
  const topicName = safeEnvVar(
    "PUBSUB_TOPIC",
    "Can't send pubsub messages without a topic."
  )

  const pubsub = createPubsub()

  if (pubsub.isEmulator) {
    throw new Error(
      `Pubsub emulator is not set up correctly. 'pubsub.isEmulator' was falsy.`
    )
  }

  const topic = pubsub.topic(topicName)
  const [topicExists] = await topic.exists()
  if (!topicExists) {
    debug(`[PUBSUB] 📡 Didn't find topic '${topicName}'. Creating...`)
    await topic.create()
    debug("[PUBSUB] ✅ Successfully created topic:", topic.name)
  }
}
