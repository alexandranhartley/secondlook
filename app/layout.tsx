import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecondLook — Recommendation",
  description:
    "A fast, confidence-building tool that helps secondhand shoppers decide on the spot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
