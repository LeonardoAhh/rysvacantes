export function assertPublicEnv(env: Record<string, string | undefined>) {
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith("VITE_") || !value) continue
    const candidate = value.trim()
    let privileged = candidate.startsWith("sb_secret_")
    try {
      privileged ||=
        JSON.parse(
          Buffer.from(candidate.split(".")[1] ?? "", "base64url").toString()
        ).role === "service_role"
    } catch {
      /* Non-JWT public values are expected. */
    }
    if (
      privileged ||
      /(?:SECRET|SERVICE_ROLE|PRIVATE_KEY|PASSWORD)/i.test(name)
    ) {
      throw new Error(
        "Una variable VITE_ contiene o declara un secreto. Revisa las variables públicas antes de compilar."
      )
    }
  }
}
