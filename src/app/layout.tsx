import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AdminDataProvider } from "@/context/AdminDataContext";

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
      className={`${inter.variable} min-h-full h-full antialiased overflow-hidden bg-[#EBECEF]`}
    >
      <body className={`${inter.className} min-h-full h-full h-[100dvh] max-h-[100dvh] text-[#202328] flex flex-col font-sans overflow-hidden bg-[#EBECEF] selection:bg-[#F6CE46] selection:text-[#202328]`}>
        <ToastProvider>
          <QueryProvider>
            <AuthProvider>
              <AdminDataProvider>
                {children}
              </AdminDataProvider>
            </AuthProvider>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
