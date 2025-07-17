export function parseCookie(cookieString: string, name: string) {
  const cookies = cookieString.split(";")
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=")
    if (key === name) {
      return value
    }
  }
  return null
}
