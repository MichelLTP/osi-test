export async function rawBackendFetch(
  token: string,
  method: string,
  url: string,
  { body = null, contentType = "application/json" } = {}
) {
  const headers = {
    Authorization: "Bearer " + token,
  }
  if (contentType !== null) {
    headers["Content-Type"] = contentType
  }

  const opts = {
    method: method,
    headers: headers,
  }
  if (body !== null) {
    opts["body"] = body
  }

  // console.log(opts)

  return fetch(url, opts)
}

export async function backendFetch(
  token: string,
  method: string,
  url: string,
  {
    body = null,
    contentType = "application/json",
    raiseError = true,
    customMessage = "Failed to fetch!",
  } = {}
) {
  const response = await rawBackendFetch(token, method, url, {
    body,
    contentType,
  })
  if (raiseError && !response.ok) {
    throw new Error(
      `${customMessage} in backendFetch. Status: ${
        response.status
      }, ${await response.text()}`
    )
  }
  return response
}
