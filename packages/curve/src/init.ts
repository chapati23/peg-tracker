import curve from "@curvefi/api"
import debug from "./debug.js"

export default async function initCurveApi() {
  if (
    process.env["INFURA_API_KEY"] == null ||
    typeof process.env["INFURA_API_KEY"] !== "string"
  ) {
    throw new Error(
      "Missing env var INFURA_API_KEY. Can't use Curve API without Infura."
    )
  }

  debug("Init web3 connection via Infura...")
  await curve.init(
    "Infura",
    { network: "homestead", apiKey: process.env["INFURA_API_KEY"] },
    { chainId: 1 }
  )

  debug("Fetch pools...")
  await curve.factory.fetchPools()
  debug("Fetch factory pools...")
  await curve.cryptoFactory.fetchPools()

  return curve
}
