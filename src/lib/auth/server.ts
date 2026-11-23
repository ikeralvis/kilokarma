import { createNeonAuth } from "@neondatabase/auth/next/server";
import { env } from "@/lib/env";

let instance: ReturnType<typeof createNeonAuth> | undefined;

/** Instancia perezosa: las variables solo se leen en ejecución, no al importar. */
export function auth() {
  instance ??= createNeonAuth({
    baseUrl: env.authBaseUrl(),
    cookies: { secret: env.authCookieSecret() },
  });
  return instance;
}
