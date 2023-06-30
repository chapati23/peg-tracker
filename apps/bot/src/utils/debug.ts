import _debug from "debug"
import type { CustomContext } from "../types.js"

const debug = _debug("bot")

// Define the wrapping function
export default function debugWrapper(...args: Array<CustomContext | unknown>) {
  if (args[0] && typeof args[0] === "object" && "update" in args[0]) {
    const ctx = args[0] as CustomContext
    args.shift()
    debug(`[${ctx.update.update_id}]`, ...args)
  } else {
    // NOTE: I don't understand how to correctly type this, it works fine 🤷‍♂️
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    debug(...args)
  }
}
