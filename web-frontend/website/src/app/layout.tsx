import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
      </head>
      <body className={inter.className}>
        <AppRouterCacheProvider>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
