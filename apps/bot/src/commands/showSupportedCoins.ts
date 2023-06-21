import { getSupportedCoins } from "curve"
import { escapeMarkdown } from "telegram"
import type { CustomContext } from "../types.js"

export default async function showSupportedCoins(ctx: CustomContext) {
  const coins = await getSupportedCoins()

  // Group coins by the first letter
  const groupedCoins: { [letter: string]: string[] } = coins.reduce(
    (groups, coin) => {
      const firstLetter = coin[0]?.toUpperCase()

      if (!firstLetter) {
        throw new Error(
          `[${showSupportedCoins.name}] firstLetter was undefined which should never happen`
        )
      }

      /* eslint-disable security/detect-object-injection */
      groups[firstLetter] = groups[firstLetter] || []
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      groups[firstLetter]!.push(coin)
      /* eslint-enable security/detect-object-injection */
      return groups
    },
    {} as { [letter: string]: string[] }
  )

  // Store the grouped coins in a string
  let output = ""
  Object.entries(groupedCoins)
    // sort group members alphabetically
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([letter, coins]) => {
      const formattedCoins = coins.map((coin, index) => {
        if (index === 0) {
          return `*${letter.toUpperCase()}*${coin.slice(1).toUpperCase()}`
        }
        return coin.toUpperCase()
      })
      const coinsLine = formattedCoins.join(" / ")
      output += `- ${coinsLine}\n`
    })

  await ctx.replyWithMarkdownV2(escapeMarkdown(output))
}
