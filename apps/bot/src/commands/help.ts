import addAlert from "./addAlertSubscriptionWizard/index.js"
import deleteAlertSubscription from "./deleteAlertSubscription.js"
import listAlertsSubscriptions from "./listAlertSubscriptions.js"
import showSupportedCoins from "./showSupportedCoins.js"
import start from "./start.js"
import type { CustomContext } from "../types.js"

export const supportedCommands = [
  {
    name: "add",
    command: addAlert,
    description:
      "Set up a new alert to track the peg of a coin you're interested in",
  },
  {
    name: "coins",
    command: showSupportedCoins,
    description: "View a list of all supported coins to set alerts for",
  },
  {
    name: "delete",
    command: deleteAlertSubscription,
    description: "Delete one or all of your alerts",
  },
  {
    name: "help",
    command: help,
    description: "Get a list of supported commands",
  },
  {
    name: "list",
    command: listAlertsSubscriptions,
    description: "Show a list of your existing alerts",
  },
  {
    name: "start",
    command: start,
    description:
      "Create a user account so the bot can set up personalized alerts for you",
  },
]

export default async function help(ctx: CustomContext) {
  const msg = supportedCommands
    .map((cmd) => `*/${cmd.name}*\n${cmd.description}`)
    .join("\n\n")
  ctx.replyWithMarkdownV2(`Here's what you can do:\n\n${msg}`)
}
