/** Colores de acento sugeridos (el usuario puede elegir cualquiera). */
export const ACCENT_PRESETS = ["#9ec4f4", "#8fd3c9", "#b4a7f0", "#f2a7c3", "#f4b183", "#e6cf6a", "#9bd68a", "#8f9bb3"];
export const DEFAULT_ACCENT = "#9ec4f4";

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHex = (s: string) => HEX.test(s);

/** Tono (0‑359) y color de texto legible sobre el acento. */
export function accentVars(hex: string) {
  const c = isHex(hex) ? hex : DEFAULT_ACCENT;
  const r = parseInt(c.slice(1, 3), 16) / 255;
  const g = parseInt(c.slice(3, 5), 16) / 255;
  const b = parseInt(c.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  let h = 0;
  if (mx !== mn) {
    const d = mx - mn;
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { hue: h, accent: c.toLowerCase(), fg: lum > 0.55 ? "#12233d" : "#ffffff" };
}

/** Aplica el acento en la página y lo recuerda en este dispositivo. */
export function applyAccent(hex: string, persist = true) {
  const v = accentVars(hex);
  const s = document.documentElement.style;
  s.setProperty("--h", String(v.hue));
  s.setProperty("--accent", v.accent);
  s.setProperty("--accent-fg", v.fg);
  if (persist) {
    try {
      localStorage.setItem("accent", v.accent);
    } catch {
      /* modo privado */
    }
  }
}

/** Script que se ejecuta antes de pintar para evitar parpadeos (misma lógica que arriba). */
export const THEME_INIT_SCRIPT = `try{var d=document.documentElement,t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.dataset.theme=t;var a=localStorage.getItem("accent");if(/^#[0-9a-fA-F]{6}$/.test(a)){var r=parseInt(a.slice(1,3),16)/255,g=parseInt(a.slice(3,5),16)/255,b=parseInt(a.slice(5,7),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0;if(mx!==mn){var q=mx-mn;h=mx===r?((g-b)/q)%6:mx===g?(b-r)/q+2:(r-g)/q+4;h=Math.round(h*60);if(h<0)h+=360}var l=0.2126*r+0.7152*g+0.0722*b;d.style.setProperty("--h",h);d.style.setProperty("--accent",a);d.style.setProperty("--accent-fg",l>0.55?"#12233d":"#ffffff")}}catch(e){}`;
