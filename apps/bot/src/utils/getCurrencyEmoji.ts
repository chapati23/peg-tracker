export default function getCurrencyEmoji(currency: string) {
  switch (currency) {
    case "EUR":
      return "💶"
    case "USD":
      return "💵"
    case "YEN":
      return "💴"
    case "GBP":
      return "💷"
    default:
      return undefined
  }
}
