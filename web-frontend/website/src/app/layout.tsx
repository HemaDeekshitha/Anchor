import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Viewport } from "next";
import "./theme-tokens.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--anchor-font-inter",
});

export const metadata = {
  title: "Anchor",
  description: "Anchor – stay grounded, one step at a time",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Anchor",
    statusBarStyle: "default" as const,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.querySelector('meta[name=\"theme-color\"]')?.setAttribute('content','#1a2332');}}}catch(e){}",
          }}
        />
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <AppRouterCacheProvider>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
