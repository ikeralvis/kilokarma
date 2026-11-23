/** Icono de Recapi (R azul sobre blanco). */
export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/branding/recapi-R-azul.svg" width={size} height={size} alt="Recapi" className={className} draggable={false} />;
}
