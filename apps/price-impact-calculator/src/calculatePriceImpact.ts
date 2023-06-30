import curve from "@curvefi/api"
import debug from "./utils/debug.js"
import type { PubSubEvent } from "./types.js"
import type { CloudEvent } from "@google-cloud/functions-framework"
import type { PriceImpact } from "shared-types"

// Function to calculate how much MIM can be sold before the price drops by a certain percentage
export default async function calculatePriceImpact(
  from: string,
  to: string,
  poolLiquidity: number,
  event: CloudEvent<PubSubEvent>
): Promise<PriceImpact[]> {
  const swapAmounts: number[] = []

  // 1. Start by swapping 10% of the total pool liquidity
  // 2. Then increase the swap amounts by 3% with each iteration until we hit 39% (which should depeg any pool)
  for (let i = 0.1; i <= 0.39; i += 0.03) {
    swapAmounts.push(poolLiquidity * i)
  }

  // Iteratively swap higher and higher amounts  until price impact hits our threshold level
  const priceImpacts = await getPriceImpactsFromCurveRouter(
    swapAmounts,
    from,
    to,
    event
  )

  return filterPriceImpacts(priceImpacts)
}

// Parallelize fetching of swap queries to speed up performance
async function getPriceImpactsFromCurveRouter(
  swapAmounts: number[],
  from: string,
  to: string,
  event: CloudEvent<PubSubEvent>
) {
  const priceImpacts = []
  for (const swapAmount of swapAmounts) {
    debug(
      event,
      `🌀 Swapping ${swapAmount.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })} ${from} to ${to}...`
    )
    const priceImpact = await curve.router.priceImpact(from, to, swapAmount)
    debug(event, `🟰 ${priceImpact.toFixed(2)}% price impact`)

    priceImpacts.push({ swapAmount, priceImpact })
  }

  return priceImpacts
}

/**
 * Filters an array of price impacts based on specified range filters
 * and keeps only the items with the lowest price impact value for each range.
 * @param priceImpacts - The array of price impacts to filter
 * @returns The filtered array with the lowest price impact values for each range
 **/
function filterPriceImpacts(priceImpacts: PriceImpact[]) {
  const filteredImpacts: PriceImpact[] = []

  const rangeFilters = [
    { min: 0.3, max: 1 },
    { min: 1, max: 5 },
    { min: 5, max: 10 },
    { min: 10, max: 20 },
    { min: 20, max: 100 },
  ]

  for (const filter of rangeFilters) {
    let lowestItem: PriceImpact | null = null

    for (const item of priceImpacts) {
      const { priceImpact } = item

      if (
        priceImpact >= filter.min &&
        priceImpact < filter.max &&
        (!lowestItem || priceImpact < lowestItem.priceImpact)
      ) {
        lowestItem = item
      }
    }

    if (lowestItem) {
      filteredImpacts.push(lowestItem)
    }
  }

  return filteredImpacts
}
