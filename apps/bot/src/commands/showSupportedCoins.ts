import { getSupportedCoins } from "curve"
import type { CustomContext } from "../types.js"

export default async function showSupportedCoins(ctx: CustomContext) {
  ctx.reply(`- ${getSupportedCoins().sort().join("\n- ").toUpperCase()}`)
}
