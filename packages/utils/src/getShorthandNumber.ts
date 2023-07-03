export default function getShorthandNumber(number: number): string {
  const prefixes = ["", "K", "M", "B"]
  const tier = (Math.log10(Math.abs(number)) / 3) | 0

  if (tier === 0) {
    return Math.round(number).toString()
  }

  // Safe because no user input
  // eslint-disable-next-line security/detect-object-injection
  const suffix = prefixes[tier]
  const scale = Math.pow(10, tier * 3)

  const scaledNumber = number / scale
  const roundedNumber = Math.round(scaledNumber * 10) / 10

  return roundedNumber.toString() + suffix
}
