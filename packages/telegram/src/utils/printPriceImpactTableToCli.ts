import chalk from "chalk"
import CliTable3 from "cli-table3"
import debug from "./debug.js"
import type { Alert, PriceImpact } from "shared-types"

export default async function printPriceImpactTableToCli(
  alert: Alert,
  depegCheckResults: PriceImpact[]
) {
  // Init results table
  const table = new CliTable3({
    head: [`${alert.coin} to ${alert.peggedTo}`, "Price Impact"],
    style: { head: [] },
  })

  // Push results into the table
  depegCheckResults.forEach((row) => {
    const { swapAmount, priceImpact } = row
    const priceImpactString = `${row.priceImpact.toFixed(2)}%`

    let priceImpactColorized

    if (priceImpact >= 0.5 && priceImpact < 1) {
      priceImpactColorized = chalk.yellow.bold(priceImpactString)
    } else if (priceImpact >= 1 && priceImpact < 3) {
      chalk.rgb(255, 165, 0)
      priceImpactColorized = chalk.bold(priceImpactString)
    } else if (priceImpact >= 3) {
      priceImpactColorized = chalk.red.bold(priceImpactString)
    } else {
      priceImpactColorized = chalk.green(priceImpactString)
    }

    table.push([swapAmount.toLocaleString(), priceImpactColorized])
  })

  debug(`\n${table.toString()}`)
}
