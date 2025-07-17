import { getRequiredServerEnvVar } from "@/utils/darkTheme/misc"

export var BACKEND_API_BASE_URL = getRequiredServerEnvVar(
  "BACKEND_API_BASE_URL"
)
export var BACKEND_API_BASE_PROTOCOL = getRequiredServerEnvVar(
  "BACKEND_API_PROTOCOL"
)
export var BACKEND_API_BASE_URL_HTTP = `${BACKEND_API_BASE_PROTOCOL}://${BACKEND_API_BASE_URL}`
export var BACKEND_API_BASE_URL_WS = `ws://${BACKEND_API_BASE_URL}`

console.log("BACKEND_API_BASE_URL_HTTP", BACKEND_API_BASE_URL_HTTP)
console.log("BACKEND_API_BASE_URL_WS", BACKEND_API_BASE_URL_WS)
