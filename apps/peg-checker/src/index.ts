import { Firestore } from "@google-cloud/firestore"
import { cloudEvent } from "@google-cloud/functions-framework"
import { getAlertById, getAlertSubscriptionsByUserId } from "alerts"
import {
  initCurveApi,
  findLargestPoolForCoin,
  getCoinShareOfPool,
  calculateSellPressureToDepeg,
  getPoolLiquidity,
} from "curve"
import { sendPriceImpactResults } from "telegram"
import { getAllUsers } from "user"
import debug from "./utils/debug.js"

const db = new Firestore({ preferRest: true })

if (
  process.env["TELEGRAM_BOT_TOKEN"] == null ||
  typeof process.env["TELEGRAM_BOT_TOKEN"] !== "string"
) {
  throw new Error(
    "Missing env var TELEGRAM_BOT_TOKEN. Can't send Telegram messages without a valid bot token."
  )
}

/****************** COLD START SECTION ******************/
/* This code can be shared by multiple cloud function
/* instances. Here we define global state and init our API
/* connections so they can be shared across function
/* instances which should speed up overall performance.
/********************************************************/
await initCurveApi()

/****************** CLOUD FUNCTION ******************/
cloudEvent("pegChecker", async (/*cloudEvent*/) => {
  try {
    // 1. Get all users
    const users = await getAllUsers(db)

    // 2. For every user => get their alerts
    for (const userRef of users) {
      const user = await userRef.get().then((u) => u.data())
      debug(`[${userRef.id}] USER:`, user)

      const alertSubscriptions = await getAlertSubscriptionsByUserId(
        userRef.id,
        db
      )

      if (!alertSubscriptions) {
        return `No alert subscriptions found for user ${user}`
      }

      debug(`[${userRef.id}] Alert Subscriptions:`, alertSubscriptions)

      // 3. Process every alert
      for (const sub of alertSubscriptions) {
        const alert = await getAlertById(sub.alertId, db)
        if (!alert) throw new Error(`Alert for ${sub.alertId} was null`)

        debug(`[${alert.coin}] Begin check...`)
        const pool = await findLargestPoolForCoin(alert.coin, alert.peggedTo)
        const lastKnownPoolShareInPercent = alert.lastKnownPoolShareInPercent
        const currentPoolShareInPercent = await getCoinShareOfPool(
          alert.coin,
          pool
        )

        // Only trigger alert if coin got closer to depeg since last check (or if we don't have a value for the last known depeg check)
        debug(
          `[${alert.coin}] Last known pool share: ${lastKnownPoolShareInPercent}%`
        )
        debug(
          `[${alert.coin}] Current pool share: ${currentPoolShareInPercent}%`
        )
        if (
          !lastKnownPoolShareInPercent ||
          parseFloat(currentPoolShareInPercent) <
            parseFloat(lastKnownPoolShareInPercent)
        ) {
          debug(`[${alert.coin}] Trigger alert!`)
          const totalPoolLiquidity = await getPoolLiquidity(pool)
          const priceImpactResults = await calculateSellPressureToDepeg(
            alert.coin,
            alert.peggedTo,
            totalPoolLiquidity
          )

          await sendPriceImpactResults({
            alert,
            priceImpactResults,
            userId: userRef.id,
          })

          debug(
            `[${alert.coin}] Update last known pool share of ${alert.coin} in DB`
          )
          await db.doc(`users/${userRef.id}/alerts/${alert.id}`).update({
            lastKnownPoolShareInPercent: currentPoolShareInPercent.toFixed(2),
          })
        } else {
          debug(
            `[${alert.coin}] No alert triggered because current share of coin has improved since the last check`
          )
        }
      }
    }
    return "✅ Successfully checked all peg alerts"
  } catch (error) {
    debug("[❌ ERROR]", error)
    throw new Error(`❌ Unexpected Error while checking peg alerts ${error}`)
  }
})
