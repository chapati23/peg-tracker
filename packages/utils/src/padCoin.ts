export default function padCoin(coin: string) {
  return coin.length === 3 ? `${coin} ` : coin
}
