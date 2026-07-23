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
  title: "From Weights to Tokens",
  description:
    "An interactive academy for AI models, inference systems, and GPU execution.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "From Weights to Tokens",
    description:
      "Understand AI models, inference systems, and GPU execution as one connected journey.",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "From Weights to Tokens: model weights flow through a GPU into streamed tokens",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">
          Skip to lesson
        </a>
        {children}
      </body>
    </html>
  );
}
