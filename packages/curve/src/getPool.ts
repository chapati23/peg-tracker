import curve from "@curvefi/api"
import { PoolTemplate } from "@curvefi/api/lib/pools/PoolTemplate.js"

export default function getPool(poolId: string): PoolTemplate {
  return curve.getPool(poolId)
}
