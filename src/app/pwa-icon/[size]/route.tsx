import { ImageResponse } from "next/og";

const ALLOWED = new Set([180, 192, 512]);

export async function GET(
  req: Request,
  ctx: { params: Promise<{ size: string }> },
) {
  const { size: raw } = await ctx.params;
  const size = Number(raw);
  if (!ALLOWED.has(size)) return new Response("Not found", { status: 404 });

  // Maskable: contenido dentro del 80 % central (zona segura).
  const maskable = new URL(req.url).searchParams.get("maskable") === "1";
  const glyph = Math.round(size * (maskable ? 0.42 : 0.55));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e1113",
          borderRadius: maskable ? 0 : Math.round(size * 0.22),
        }}
      >
        <div
          style={{
            width: glyph,
            height: glyph,
            borderRadius: "50%",
            background: "#ff7a5c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0e1113",
            fontSize: Math.round(glyph * 0.6),
            fontWeight: 800,
          }}
        >
          K
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
