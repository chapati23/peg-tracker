import { Firestore } from "@google-cloud/firestore"
import { cloudEvent } from "@google-cloud/functions-framework"
import { getAlertById, updatePoolShare } from "alerts"
import {
  findLargestPoolForCoin,
  getCoinShareOfPool,
  getPoolLiquidity,
  initCurveApi,
} from "curve"
import { sendPriceImpactResults } from "telegram"
import calculateSellPressureToDepeg from "./calculatePriceImpact.js"
import debug from "./utils/debug.js"
import isPubSubEvent from "./utils/isPubsubEvent.js"
import type { PubSubEvent } from "./types.js"

/****************** COLD START SECTION ******************/
/* This code can be shared by multiple cloud function
/* instances. Here we define global state and init our API
/* connections so they can be shared across function
/* instances which should speed up overall performance.
/********************************************************/

// In development mode, set up pubsub emulator first
if (process.env["NODE_ENV"] !== "production") {
  const { default: pubsubSetup } = await import("./utils/pubsubSetup.js")
  await pubsubSetup()
}

// Init Web3 connection via Infura
await initCurveApi()

// Init Firestore (prefer rest because gRPC adds quite a bit of ms to the cold start performance)
const db = new Firestore({ preferRest: true })

/**********/
/* LAUNCH */
/**********/

// Tracking the last processed event ID to avoid infinite retries.
// The swap simulations can take up to a minute during which the
// Pubsub keeps re-consuming the event until the function returns.
// TODO: See how robust this is in prod when we can potentially have multiple users hitting this function simultaneously
const processedEventIds: Array<string> = []

cloudEvent<PubSubEvent>("priceImpactCalculationRequest", async (event) => {
  debug(event, "Processed Event IDs:", processedEventIds)

  if (!processedEventIds.includes(event.id)) {
    processedEventIds.push(event.id)
  } else {
    debug(
      event,
      `❌ Event ID ${event.id} already processed. Exiting to avoid redundant execution.`
    )
    return
  }

  if (!isPubSubEvent(event.data)) {
    debug(
      event,
      "❌ Received event does not look like a pubsub event: ",
      event.data
    )
    throw new Error(
      `Received event does not look like a pubsub event: ${event.data}`
    )
  }

  debug(event, "Event", event)

  const alertId = Buffer.from(event.data.message.data, "base64").toString()
  if (!alertId) {
    debug(event, "❌ Failed to read data from event:", event.data)
    return
  }

  const userId = event.data.message.attributes
    ? event.data.message.attributes["userId"]
    : undefined
  if (!userId) {
    debug(
      event,
      "❌ Failed to find user ID in event attributes:",
      event.data.message.attributes
    )
    return
  }

  debug(event, `Processing alert '${alertId}' for user ${userId}`)

  const alert = await getAlertById(alertId)

  if (!alert) {
    throw new Error(`Couldn't find alert with ID ''`)
  }

  debug(
    event,
    `⏳ Updating pool share for ${alert.id}, last known pool share: ${alert.lastKnownPoolShareInPercent}%`
  )
  const pool = await findLargestPoolForCoin(alert.coin, alert.peggedTo)
  const currentPoolShareInPercent = await getCoinShareOfPool(alert.coin, pool)
  await updatePoolShare(alert.id, currentPoolShareInPercent, db)
  debug(
    event,
    `✅ Updated pool share for ${alert.id}: ${currentPoolShareInPercent}%`
  )

  debug(
    event,
    `⏳ Calculating sell pressure to depeg ${alert.coin} by querying Curve Router with different swap amounts...`
  )
  const poolLiquidity = await getPoolLiquidity(pool)
  const priceImpactResults = await calculateSellPressureToDepeg(
    alert.coin,
    alert.peggedTo,
    poolLiquidity,
    event
  )
  debug(event, `✅ Calculated sell pressure to depeg for ${alert.coin}`)
  debug(event, `📡 Sending results to user via telegram msg...`)
  await sendPriceImpactResults({ alert, priceImpactResults, userId })
  debug(event, `✅ Sent price impact results to user ${userId}`)
})
