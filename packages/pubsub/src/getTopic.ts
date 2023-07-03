import createPubsub from "./createPubsub.js"
import debug from "./debug.js"

export default async function getTopic(topicName: string) {
  debug(`📡 Fetching pubsub topic '${topicName}'...`)

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

  debug(`✅ Fetched pubsub topic:`, topic.name)

  return topic
}
