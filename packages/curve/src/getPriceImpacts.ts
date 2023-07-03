import curve from "@curvefi/api"
import debug from "./debug.js"
import type { CloudEvent } from "@google-cloud/functions-framework"
import type { PubSubEvent } from "shared-types"

// Parallelize fetching of swap queries to speed up performance
export default async function getPriceImpacts(
  swapAmounts: number[],
  from: string,
  to: string,
  event: CloudEvent<PubSubEvent>
) {
  const priceImpacts = []
  for (const swapAmount of swapAmounts) {
    debug(
      `[${event.id}] 🌀 Swapping ${swapAmount.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })} ${from} to ${to}...`
    )
    const priceImpact = await curve.router.priceImpact(from, to, swapAmount)
    debug(`[${event.id}] 🟰 ${priceImpact.toFixed(2)}% price impact`)

    priceImpacts.push({ swapAmount, priceImpact })

    if (priceImpact > 30) break
  }

  return priceImpacts
}
