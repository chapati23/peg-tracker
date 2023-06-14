import { WizardScene } from "telegraf/scenes"
import addMiddlewaresToWizard from "../../middleware/addMiddlewaresToWizard.js"
import cancelMiddleware from "../../middleware/cancel.js"
import isAcceptedMessageTypeMiddleware from "../../middleware/isAcceptedMessageType.js"
import step1AskForTicker from "./step1AskForTicker.js"
import step2FindCoin from "./step2FindCoin.js"
import step3SelectReferenceAssetManually from "./step3SelectReferenceAssetManually.js"
import type { CustomContext } from "../../types.js"

export const AddAlertSubscriptionWizard = new WizardScene<CustomContext>(
  "addWizard",
  step1AskForTicker,
  step2FindCoin,
  step3SelectReferenceAssetManually
)

// Add middlewares that should run on each step
addMiddlewaresToWizard(AddAlertSubscriptionWizard, [
  cancelMiddleware,
  isAcceptedMessageTypeMiddleware,
])

export default async function addAlert(ctx: CustomContext) {
  ctx.scene.enter("addWizard")
}
