import { table } from "table"
import { getShorthandNumber } from "utils"
import type { Alert, PriceImpact } from "shared-types"

export default function formatPriceImpactTableForTelegram(
  alert: Alert,
  priceImpactValues: PriceImpact[]
) {
  const tableData = [[`${alert.coin} to ${alert.peggedTo}`, "Price Impact"]]

  priceImpactValues.forEach((row) => {
    const priceImpactFormatted =
      (row.priceImpact > 1 ? "⚠️" : "") + row.priceImpact.toFixed(2) + "%"

    tableData.push([getShorthandNumber(row.swapAmount), priceImpactFormatted])
  })

  return `<pre>${table(tableData)}</pre>`
}
