export const PHILIPPINE_MOBILE_NUMBER_ERROR =
  "Enter a 10-digit Philippine mobile number that starts with 9."

export const PHILIPPINE_MOBILE_NUMBER_PREFIX = "+63"

export function getPhilippineMobileLocalDigits(value: string) {
  const digits = value.replace(/\D/g, "")

  if (!digits || digits === "6" || digits === "63") {
    return ""
  }

  if (digits.startsWith("63")) {
    return digits.slice(2, 12)
  }

  if (digits.startsWith("09")) {
    return digits.slice(1, 11)
  }

  return digits.slice(0, 10)
}

export function formatPhilippineMobileLocalInput(value: string) {
  const localDigits = getPhilippineMobileLocalDigits(value)
  const firstGroup = localDigits.slice(0, 3)
  const secondGroup = localDigits.slice(3, 6)
  const thirdGroup = localDigits.slice(6, 10)

  return [firstGroup, secondGroup, thirdGroup].filter(Boolean).join(" ")
}

export function formatPhilippineMobileNumberInput(value: string) {
  const localNumber = formatPhilippineMobileLocalInput(value)

  if (!localNumber) {
    return PHILIPPINE_MOBILE_NUMBER_PREFIX
  }

  return `${PHILIPPINE_MOBILE_NUMBER_PREFIX} ${localNumber}`
}

export function getPhilippineMobileNumberError(value: string) {
  const localDigits = getPhilippineMobileLocalDigits(value)

  if (!localDigits) {
    return "Contact number is required."
  }

  if (localDigits.length === 10 && localDigits.startsWith("9")) {
    return null
  }

  return PHILIPPINE_MOBILE_NUMBER_ERROR
}
