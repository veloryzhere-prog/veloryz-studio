import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VELORYZ Studio",
  description: "Independent design, development and digital products.",
  icons: {
    icon: "/assets/favicon.svg",
    shortcut: "/favicon.ico",
    apple: "/assets/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
