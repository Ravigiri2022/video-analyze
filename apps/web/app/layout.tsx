import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
