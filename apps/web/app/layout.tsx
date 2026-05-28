import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Vilyze",
    default: "Vilyze — AI Video Analysis",
  },
  description: "Upload any video or YouTube link and get AI-powered insights: attention curves, transcripts, engagement metrics, and recommendations.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Vilyze",
    title: "Vilyze — AI Video Analysis",
    description: "AI-powered video analysis: attention, transcripts, and actionable insights.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#2563EB" height={3} showSpinner={false} shadow="0 0 10px #2563EB,0 0 5px #2563EB" />
        {children}
        <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "var(--font-geist-sans)" } }} />
      </body>
    </html>
  );
}
