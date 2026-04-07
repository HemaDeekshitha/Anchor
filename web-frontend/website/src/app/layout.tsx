import "./globals.css";
import { Inter } from "next/font/google";
import MuiRegistry from "@/components/MuiRegistry";
// import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Anchor",
  description: "Anchor – stay grounded, one step at a time",
  icons: {
    icon: "/favicon.ico", // ✅ Uses src/app/favicon.ico
  },
};

// export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <ThemeToggle /> */}
        <MuiRegistry>{children}</MuiRegistry>
      </body>
    </html>
  );
}
