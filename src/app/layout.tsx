import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Feed",
  description: "Curated tech stories from various sources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-serif antialiased">
        {children}
      </body>
    </html>
  );
}
