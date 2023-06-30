import debug from "../../utils/debug.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function updatePoolShare(
  alertId: string,
  poolShare: string,
  db: Firestore
): Promise<void> {
  try {
    debug(
      `[${updatePoolShare.name}] Updating pool share for alert '${alertId}'...`
    )
    await db.doc(`alerts/${alertId}`).update({
      lastKnownPoolShareInPercent: poolShare,
    })
    debug(
      `[${updatePoolShare.name}] Successfully updated pool share for alert '${alertId}':`
    )
  } catch (error) {
    debug(
      `[${updatePoolShare.name}] Couldn't update pool share for alert '${alertId}'`,
      error
    )
    throw error
  }
}
