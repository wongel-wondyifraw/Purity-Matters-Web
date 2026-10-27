import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AdminDataProvider } from "@/context/AdminDataContext";
import { PwaProvider } from "@/context/PwaContext";
import { IosInstallModal } from "@/components/pwa/IosInstallModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#202328",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Purity Matters Web Console | Admin Management",
  description: "Administrative dashboard for managing Telegram bot clients, counselling requests, inner healing sessions, courses, and digital resources.",
  manifest: "/manifest.json?v=3",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Purity Matters",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: [
      { url: "/icons/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
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
                <PwaProvider>
                  {children}
                  <IosInstallModal />
                </PwaProvider>
              </AdminDataProvider>
            </AuthProvider>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
