import curve from "@curvefi/api"
import { curve as _curve } from "@curvefi/api/lib/curve.js"
import debug from "./debug.js"
import type { IDict, IPoolData } from "@curvefi/api/lib/interfaces.js"

export type FilteredPool = Omit<
  IPoolData,
  "swap_abi" | "gauge_abi" | "deposit_abi" | "gauge_address" | "sCurveRewards"
>

export default function getPoolsForCoin(coin: string): FilteredPool[] {
  const mainPools: IDict<IPoolData> = _curve.constants.POOLS_DATA
  const factoryPools: IDict<IPoolData> = _curve.constants.FACTORY_POOLS_DATA
  const crvusdPools: IDict<IPoolData> =
    _curve.constants.CRVUSD_FACTORY_POOLS_DATA
  const pools = { ...mainPools, ...factoryPools, ...crvusdPools }

  debug(Object.keys(pools).filter((p) => p.includes("factory-v2-144")))
  const a = curve.getPool("factory-v2-144")
  debug("YOOOO", a)

  return Object.entries(pools)
    .filter(([, pool]) => {
      return pool.wrapped_coins
        .map((c) => c.toUpperCase())
        .includes(coin.toUpperCase())
    })
    .reduce((acc: FilteredPool[], [, pool]) => {
      // strip out keys with lots of data we don't need
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        swap_abi,
        gauge_abi,
        deposit_abi,
        sCurveRewards_abi,
        gauge_address,
        ...filteredPool
      } = pool
      /* eslint-enable @typescript-eslint/no-unused-vars */
      acc.push(filteredPool)
      return acc
    }, [])
}
