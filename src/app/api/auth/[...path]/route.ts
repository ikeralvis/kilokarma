import { auth } from "@/lib/auth/server";

type Ctx = { params: Promise<{ path: string[] }> };
const h = (m: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") => (req: Request, ctx: Ctx) =>
  auth().handler()[m](req, ctx);

export const GET = h("GET");
export const POST = h("POST");
export const PUT = h("PUT");
export const DELETE = h("DELETE");
export const PATCH = h("PATCH");
