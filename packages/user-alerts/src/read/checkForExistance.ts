import { getAlertByCoin } from "alerts"
import findUserAlert from "./findByUserIdAndAlertId.js"
import type { Firestore } from "@google-cloud/firestore"

export default async function alertSubscriptionExists(
  userId: string,
  coin: string,
  db: Firestore
) {
  const alert = await getAlertByCoin(coin, db)

  if (alert) {
    return !!(await findUserAlert(userId, alert.id, db))
  } else {
    return false
  }
}
