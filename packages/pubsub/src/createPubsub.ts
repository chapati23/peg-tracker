import { PubSub } from "@google-cloud/pubsub"
import debug from "./debug.js"

// NOTE: Read about the general approach for connecting to the local pubsub emulator ⬇️
// https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/events.md#using-the-pubsub-emulator
export default function createPubsub() {
  let pubsub

  if (process.env["NODE_ENV"] !== "production") {
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
    debug("[EMULATOR] Connected to Pubsub emulator")
  } else {
    debug("Pubsub Env: LIVE")
    pubsub = new PubSub()
  }

  return pubsub
}
