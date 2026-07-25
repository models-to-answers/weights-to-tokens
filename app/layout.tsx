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
  title: "How AI Models Produce Answers",
  description:
    "An interactive journey from model creation, through inference, into GPU execution and the generated answer.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "How AI Models Produce Answers",
    description:
      "From weights to tokens: understand models, inference systems, and GPU execution as one connected journey.",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "How AI Models Produce Answers: an interactive journey through models, inference, and GPUs",
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
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
