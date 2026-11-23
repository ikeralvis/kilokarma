import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/accent";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recap",
  description: "Vuestro diario: trayectos con créditos, planes, viajes y logros entre amigos.",
  applicationName: "Recap",
  appleWebApp: {
    capable: true,
    title: "Recap",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: { apple: "/pwa-icon/180" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f7fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1522" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
