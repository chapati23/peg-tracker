import { Firestore } from "@google-cloud/firestore"
import { cloudEvent } from "@google-cloud/functions-framework"
import { getAlertById } from "alerts"
import {
  calculateSellPressureToDepeg,
  findLargestPoolForCoin,
  getPool,
  getPoolLink,
  getPoolLiquidity,
  getPoolsForCoin,
  initCurveApi,
} from "curve"
import { isPubSubEvent } from "pubsub"
import { sendChatMsg, sendPriceImpactResults } from "telegram"
import { getShorthandNumber, safeEnvVar } from "utils"
import debug from "./debug.js"
import printPoolBalances from "./printPoolBalances.js"
import updatePoolShare from "./updatePoolShare.js"
import type { PubSubEvent } from "shared-types"

/****************** COLD START SECTION ******************/
/* This code can be shared by multiple cloud function
/* instances. Here we define global state and init our API
/* connections so they can be shared across function
/* instances which should speed up overall performance.
/********************************************************/

safeEnvVar(
  "TELEGRAM_BOT_TOKEN",
  "Can't send Telegram messages without a bot token"
)

// Init Web3 connection via Infura
safeEnvVar("INFURA_API_KEY", "Can't use Curve API without an Infura API Key")
await initCurveApi()

// In dev, setup connection to pubsub emulator
if (process.env["NODE_ENV"] !== "production") {
  const { setupLocalPubsubSubscriptionTo } = await import("pubsub")
  const topic = safeEnvVar(
    "PUBSUB_TOPIC",
    "Can't subscribe to pubsub emulator without a topic name"
  )
  await setupLocalPubsubSubscriptionTo(topic)
}

// Init Firestore (prefer rest because gRPC adds quite a bit of ms to the cold start performance)
export const db = new Firestore({ preferRest: true })

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
    debug(event, `⚠️ Event ID ${event.id} already processed.`)
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

  debug(event, "Event Data:", event.data)

  const alertId = Buffer.from(event.data.message.data, "base64").toString()
  const alert = await getAlertById(alertId)
  if (!alert) {
    throw new Error(`Couldn't find alert with ID '${alertId}'`)
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

  debug(event, `Processing alert '${alert.id}' for user ${userId}`)

  const allPools = []
  for (const p of getPoolsForCoin(alert.coin)) {
    debug("POOL", p)
    const pool = getPool(p.name)
    allPools.push({
      name: p.name.toUpperCase(),
      liquidity: await getPoolLiquidity(pool),
      link: getPoolLink(pool),
    })
  }
  const liquidityAcrossAllPools = allPools.reduce((total, pool) => {
    total += pool.liquidity
    return total
  }, 0)

  // filter out insignificant pools with < 5% of total liquidity
  const largestPools = allPools.filter(
    (p) => (p.liquidity / liquidityAcrossAllPools) * 100 > 5
  )

  let msg = `*Main Curve Pools with ${alert.coin}*\n\n`
  largestPools
    .sort((a, b) => b.liquidity - a.liquidity)
    .forEach((p) => {
      msg += `*${p.name}*: ${getShorthandNumber(p.liquidity)} Liquidity\n${
        p.link
      }\n\n`
    })
  await sendChatMsg(msg, userId)

  // const pool = await findLargestPoolForCoin(alert.coin, alert.peggedTo)
  // await sendChatMsg( `*Largest Curve Pool: ${pool.fullName.toUpperCase()}*\n${poolLink}`, userId)
  // await printPoolBalances(pool, userId)

  // await updatePoolShare(event, alert, pool)

  // await sendChatMsg( "⌛️ Simulating increasing swap amounts until pool would depeg... (can take up to 2-5 minutes)", userId)
  // const priceImpactResults = await calculateSellPressureToDepeg(
  //   alert.coin,
  //   alert.peggedTo,
  //   await getPoolLiquidity(pool),
  //   event
  // )
  // await sendPriceImpactResults({ alert, priceImpactResults, userId })
  await sendChatMsg(`️✅ ${alert.coin} Analysis Complete`, userId)
  debug(event, `✅ Processed alert '${alert.id}' for user '${userId}'`)
})
