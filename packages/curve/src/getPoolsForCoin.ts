import curve from "@curvefi/api"
import { NETWORK_CONSTANTS } from "@curvefi/api/lib/curve.js"
import type { IDict, IPoolData } from "@curvefi/api/lib/interfaces.js"

export type FilteredPools = Array<
  Omit<
    IPoolData,
    "swap_abi" | "gauge_abi" | "deposit_abi" | "gauge_address" | "sCurveRewards"
  >
>

export default function getPoolsForCoin(coin: string): FilteredPools {
  const pools: IDict<IPoolData> = NETWORK_CONSTANTS[curve.chainId].POOLS_DATA

  return (
    Object.entries(pools)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, pool]) => {
        return pool.underlying_coins
          .map((c) => c.toUpperCase())
          .includes(coin.toUpperCase())
      })
      .reduce(
        (
          acc: FilteredPools,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          [_, pool]
        ) => {
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
        },
        []
      )
  )
}
