import _debug from "debug"
import type { CloudEvent } from "@google-cloud/functions-framework"
import type { PubSubEvent } from "shared-types"

const debug = _debug("price-impact-calculator")

// Define the wrapping function
function debugWrapper(...args: Array<CloudEvent<PubSubEvent> | unknown>) {
  if (
    args[0] &&
    typeof args[0] === "object" &&
    "id" in args[0] &&
    "type" in args[0]
  ) {
    const event = args[0] as CloudEvent<PubSubEvent>
    args.shift()
    debug(`[${event.id}]`, ...args)
  } else {
    // NOTE: I don't understand how to correctly type this, it works fine 🤷‍♂️
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    debug(...args)
  }
}

export default debugWrapper
