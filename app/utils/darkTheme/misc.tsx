function getRequiredServerEnvVar(key: string) {
  try {
    return process.env[key]
  } catch (error) {
    throw new Error(`${key} is a required env variable`)
  }
}

export { getRequiredServerEnvVar }
