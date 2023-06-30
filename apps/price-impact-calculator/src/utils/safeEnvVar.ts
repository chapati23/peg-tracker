/* eslint-disable security/detect-object-injection */
export default function safeEnvVar(envVar: string, msg?: string) {
  if (process.env[envVar] == null || typeof process.env[envVar] !== "string") {
    throw new Error(`Missing env var ${envVar}.${msg || ""}`)
  }

  return process.env[envVar] as string
}
