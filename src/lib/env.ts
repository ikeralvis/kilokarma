/** Vercel + Neon inyectan las variables con prefijo KILOKARMA_; en local usamos las normales. */
function pick(name: string): string | undefined {
  return process.env[`KILOKARMA_${name}`] ?? process.env[name];
}
function need(name: string): string {
  const v = pick(name);
  if (!v) throw new Error(`Falta la variable ${name} (o KILOKARMA_${name})`);
  return v;
}

export const env = {
  databaseUrl: () => need("DATABASE_URL"),
  authBaseUrl: () => need("NEON_AUTH_BASE_URL"),
  authCookieSecret: () => need("NEON_AUTH_COOKIE_SECRET"),
};
