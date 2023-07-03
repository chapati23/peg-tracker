import { updatePoolShare as _updatePoolShare } from "alerts"
import { getCoinShareOfPool } from "curve"
import debug from "./debug.js"
import { db } from "./index.js"
import type { PoolTemplate } from "@curvefi/api/lib/pools/PoolTemplate.js"
import type { CloudEvent } from "@google-cloud/functions-framework"
import type { AlertWithId, PubSubEvent } from "shared-types"

// eslint-disable-next-line import/no-unused-modules
export default async function updatePoolShare(
  event: CloudEvent<PubSubEvent>,
  alert: AlertWithId,
  pool: PoolTemplate
) {
  debug(
    event,
    `⏳ Updating pool share for ${alert.id}, last known pool share: ${alert.lastKnownPoolShareInPercent}%`
  )
  const currentPoolShareInPercent = await getCoinShareOfPool(alert.coin, pool)
  await _updatePoolShare(alert.id, currentPoolShareInPercent, db)
  debug(
    event,
    `✅ Updated pool share for ${alert.id}: ${currentPoolShareInPercent}%`
  )
}
