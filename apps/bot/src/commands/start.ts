import { getChat } from "telegram"
import { createUser, getUserById } from "user"
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
  ctx.reply(`Hi ${userName}!`)

  // Get user info
  const user = await getUserById(userId, db)

  if (user) {
    ctx.reply(`Your Account: ${user.username} [${user.type}]`)
  } else {
    ctx.reply("⏳ Creating a new account for you...")

    try {
      const chat = await getChat(userId)
      await createUser(userId, chat, db)
      ctx.reply("✅ Account created! Now add some peg alerts via /add COIN")
    } catch (error) {
      ctx.reply("❌ Failed to create user account. Internal Server Error.")
    }
  }
}
