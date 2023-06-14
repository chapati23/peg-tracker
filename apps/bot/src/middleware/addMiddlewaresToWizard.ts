import type { Context } from "telegraf"
import type {
  SceneContextScene,
  WizardContextWizard,
  WizardScene,
  WizardSessionData,
} from "telegraf/scenes"

 
export default function addMiddlewaresToWizard<
  TContext extends Context & {
    scene: SceneContextScene<TContext, WizardSessionData>
    wizard: WizardContextWizard<TContext>
  }
>(
  wizard: WizardScene<TContext>,
  middlewares: Array<
    (ctx: TContext, next: () => Promise<void>) => Promise<void>
  >
): WizardScene<TContext> {
  const steps = wizard.steps.slice() // Create a shallow copy of the steps
  wizard.steps.length = 0 // Clear the original steps

  steps.forEach((step, i) => {
    const wrappedStep: (
      ctx: TContext,
      next: () => Promise<void>
    ) => Promise<void> = async (ctx, next) => {
      let currentMiddlewareIndex = 0

      const executeNextMiddleware = async () => {
        if (currentMiddlewareIndex < middlewares.length) {
          // We can ignore this because [i] is not user input
          // eslint-disable-next-line security/detect-object-injection
          const middleware = middlewares[currentMiddlewareIndex]
          currentMiddlewareIndex++
          if (typeof middleware === "function") {
            await middleware(ctx, executeNextMiddleware)
          }
        } else {
          if (typeof step === "function") {
            await step(ctx, next)
          }
        }
      }

      await executeNextMiddleware()
    }

    // We can ignore this because [i] is not user input
    // eslint-disable-next-line security/detect-object-injection
    wizard.steps[i] = wrappedStep // Add the wrapped step
  })

  return wizard
}
