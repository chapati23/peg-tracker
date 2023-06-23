import { Firestore, setLogFunction } from "@google-cloud/firestore"
import { http } from "@google-cloud/functions-framework"
import { initCurveApi } from "curve"
import { Telegraf, session, Scenes } from "telegraf"
import addAlert, {
  AddAlertSubscriptionWizard,
} from "./commands/addAlertSubscriptionWizard/index.js"
import checkAlert from "./commands/checkAlert.js"
import deleteAlertSubscription from "./commands/deleteAlertSubscription.js"
import help from "./commands/help.js"
import listAlertsSubscriptions from "./commands/listAlertSubscriptions.js"
import showSupportedCoins from "./commands/showSupportedCoins.js"
import start from "./commands/start.js"
import debug from "./utils/debug.js"
import isCallback from "./utils/isCallback.js"
import isTelegramRequest from "./utils/isTelegramRequest.js"
import type { CustomContext } from "./types.js"

if (process.env["DEBUG"] && process.env["DEBUG"].includes("firestore")) {
  setLogFunction(debug)
}

if (
  process.env["TELEGRAM_BOT_TOKEN"] == null ||
  typeof process.env["TELEGRAM_BOT_TOKEN"] !== "string"
) {
  throw new Error(
    "Missing env var TELEGRAM_BOT_TOKEN. Can't send Telegram messages without a valid bot token."
  )
}

/****************** COLD START SECTION ******************/
/* This code can be shared by multiple cloud function
/* instances. Here we define global state and init our API
/* connections so they can be shared across function
/* instances which should speed up overall performance.
/********************************************************/

// Initialize Firestore Connection, and export it so it can be re-used
export const db = new Firestore({ preferRest: true })

// Initialize the bot using the bot token
const bot = new Telegraf<CustomContext>(process.env["TELEGRAM_BOT_TOKEN"])

/**************/
/* MIDDLEWARE */
/**************/
// ❗️ Middleware must be added BEFORE defining commands (otherwise
// the 'ctx' object will be incomplete inside the command-specific code)
const stage = new Scenes.Stage<CustomContext>([AddAlertSubscriptionWizard])
bot.use(session())
bot.use(stage.middleware())

/************/
/* COMMANDS */
/************/
bot.start(async (ctx) => {
  debug("[Start :: START]")
  await start(ctx)
  debug("[Start :: END]")
})

bot.help(async (ctx) => {
  debug("[Help :: START]")
  await help(ctx)
  debug("[Help :: END]")
})

bot.command(/\badd/i, async (ctx) => {
  debug("[AddAlert :: START]")
  await addAlert(ctx)
  debug("[AddAlert :: END]")
})

bot.command(/\blist/i, async (ctx) => {
  debug("[ListAlerts :: START]")
  await listAlertsSubscriptions(ctx)
  debug("[ListAlerts :: END]")
})

bot.command(/\bcheck_(\w+)/i, async (ctx) => {
  debug("[CheckAlert :: START]")
  await checkAlert(ctx)
  debug("[CheckAlert :: END]")
})

bot.command(/\bcoins/i, async (ctx) => {
  debug("[Coins :: START]")
  await showSupportedCoins(ctx)
  debug("[Coins :: END]")
})

bot.command(/\bdelete_(\w+)/i, async (ctx) => {
  debug("[DeleteAlert :: START]")
  await deleteAlertSubscription(ctx)
  debug("[DeleteAlert :: END]")
})

if (process.env["NODE_ENV"] === "production") {
  debug(`🪝 Launching production-ready bot via webhooks...`)
  const webhookUrl = process.env["PROD_WEBHOOK_URL"]

  if (webhookUrl == null || typeof webhookUrl !== "string") {
    throw new Error(
      `Env var PROD_WEBHOOK_URL is invalid or null: ${webhookUrl}`
    )
  }
  bot.launch({
    webhook: {
      domain: webhookUrl,
      hookPath: "/botFunction/telegraf/" + bot.secretPathComponent(),
    },
  })
  debug("✅ Bot launched successfully")
  debug(`👂 Listening for requests via webhook: ${webhookUrl}`)
} else {
  // In development, use polling instead of webhooks because most local dev envs aren't accessible from the internet
  bot.launch()
}

// Graceful shutdown
process.once("SIGINT", () => {
  bot.stop("SIGINT")
})

process.once("SIGTERM", () => {
  bot.stop("SIGTERM")
})

await initCurveApi()

/**********/
/* LAUNCH */
/**********/
export default http("botFunction", async (req, res) => {
  if (!isTelegramRequest(req)) {
    debug(req.constructor.name)
    debug(
      "Invalid request. This does not look like it came from Telegram:",
      req.body
    )
    res.sendStatus(500)
  }

  if (isCallback(req.body.update)) {
    debug(
      "🆕 New request\n",
      `[${req.body.update_id}] Query: ${req.body.callback_query}\n`
    )
  } else {
    debug(
      "🆕 New request\n",
      `[${req.body.update_id}] Text: ${req.body.message?.text}\n`,
      `[${req.body.update_id}] From: ${JSON.stringify(
        req.body.message?.from
      )}\n`
    )
  }

  try {
    await bot.handleUpdate(req.body)
    debug("🏁 Request served successfully")
    res.sendStatus(200)
  } catch (error) {
    debug("❌ Error while serving request:", error)
    res.sendStatus(500)
  }
})
