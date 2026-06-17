import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriFit — Advancing Nutrition, Transforming Lives",
  description:
    "NutriFit is a premium, AI-powered health platform. Personalized TDEE & macro targets, AI-generated workouts, an AI Copilot, and instant meal analysis — all in a beautiful glassmorphism experience. Installable PWA that works offline.",
  keywords: [
    "NutriFit",
    "nutrition",
    "fitness",
    "AI health",
    "TDEE calculator",
    "macros",
    "workout generator",
    "meal analyzer",
    "AI copilot",
    "PWA",
    "offline",
  ],
  authors: [{ name: "NutriFit" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
      { url: "/icon-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: [{ url: "/icon-1024.png", sizes: "1024x1024" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NutriFit",
  },
  openGraph: {
    title: "NutriFit — Advancing Nutrition, Transforming Lives",
    description:
      "Personalized TDEE & macro targets, AI workouts, an AI Copilot, and instant meal analysis. Works offline.",
    siteName: "NutriFit",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1120",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Gabriela&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <RegisterSW />
        <OfflineBanner />
        <InstallPrompt />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
