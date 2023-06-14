import { getOrCreateUser } from "user"
import { db } from "../index.js"
import isTextMessage from "../utils/isTextMessage.js"
import type { CustomContext } from "../types.js"

export default async function start(ctx: CustomContext) {
  if (!isTextMessage(ctx.message)) {
    throw new Error(
      `ctx.message ist not a text message but was: ${ctx.message}`
    )
  }

  // Greet User
  const userName = ctx.message.from.username
  const userId = ctx.message.from.id
  ctx.reply(`Let's go, ${userName}!`)

  // Get user info
  const user = await getOrCreateUser(userId, db)
  ctx.reply(`User Info: ${user.username}`)
}
