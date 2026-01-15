import "./globals.css";
import { Inter } from "next/font/google"; // Or your font
import ThemeToggle from "@/components/ThemeToggle"; // <--- Import it

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My Responsive App",
  description: "Built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Adds the button to every page automatically */}
        <ThemeToggle />

        {children}
      </body>
    </html>
  );
}
