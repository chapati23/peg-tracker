import type { Context } from "telegraf"
import type {
  SceneContextScene,
  WizardContextWizard,
  WizardSession,
  WizardSessionData,
} from "telegraf/scenes"
import type { Message, Update, CallbackQuery } from "telegraf/types"

export interface CustomContext extends Context {
  scene: SceneContextScene<CustomContext, WizardSessionData>
  session: WizardSession & { coin?: string; userId: string }
  update:
    | Update.MessageUpdate<Message.TextMessage>
    | Update.CallbackQueryUpdate<CallbackQuery>
  wizard: WizardContextWizard<CustomContext>
}
