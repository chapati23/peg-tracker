import curve from "@curvefi/api"
import { safeEnvVar } from "utils"
import debug from "./debug.js"

export default async function initCurveApi() {
  const apiKey = safeEnvVar(
    "INFURA_API_KEY",
    "Can't use Curve API without an Infura API Key."
  )

  debug("Init web3 connection via Infura...")
  await curve.init("Infura", { network: "homestead", apiKey }, { chainId: 1 })

  debug("Fetch factory pools...")
  await curve.factory.fetchPools()
  debug("Fetch crvUSD factory pools...")
  await curve.crvUSDFactory.fetchPools()

  return curve
}
