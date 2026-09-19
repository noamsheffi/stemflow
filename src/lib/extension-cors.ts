const isExtensionOrigin = (origin: string | null) => Boolean(origin && /^chrome-extension:\/\/[a-p]{32}$/.test(origin));

export function extensionCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin"), configuredOrigin = process.env.SYLLO_EXTENSION_ORIGIN;
  const allowed = configuredOrigin ? origin === configuredOrigin : isExtensionOrigin(origin);
  return allowed ? { "Access-Control-Allow-Origin": origin!, "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS", Vary: "Origin" } : {};
}
