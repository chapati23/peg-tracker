import getAlertByCoin from "../../alerts/read/getAlertByCoin.js"
import getAlertSubscriptionByUserIdAndAlertId from "./getAlertSubscriptionByUserIdAndAlertId.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function alertSubscriptionExists(
  userId: string,
  coin: string,
  db: Firestore
) {
  const alert = await getAlertByCoin(coin, db)

  if (alert) {
    return !!(await getAlertSubscriptionByUserIdAndAlertId(
      userId,
      alert.id,
      db
    ))
  } else {
    return false
  }
}
