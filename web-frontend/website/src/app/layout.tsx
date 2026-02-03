import "./globals.css";
import { Inter } from "next/font/google";
// import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Anchor",
  description: "Anchor – stay grounded, one step at a time",
  icons: {
    icon: "/favicon.ico", // ✅ Uses src/app/favicon.ico
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <ThemeToggle /> */}
        {children}
      </body>
    </html>
  );
}
