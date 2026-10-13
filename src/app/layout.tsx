import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Purity Matters Web Console | Admin Management",
  description: "Administrative dashboard for managing Telegram bot clients, counselling requests, inner healing sessions, courses, and digital resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full bg-[var(--color-porcelain)] text-[var(--color-shadow-grey)] flex flex-col font-sans selection:bg-[#EDD338] selection:text-[#28211D]`}>
        {children}
      </body>
    </html>
  );
}
