import type { Update, CallbackQuery } from "telegraf/types"

export default function isCallback(
  update: Update
): update is Update.CallbackQueryUpdate<CallbackQuery.DataQuery> {
  return (
    !!update && "callback_query" in update && "data" in update.callback_query
  )
}
