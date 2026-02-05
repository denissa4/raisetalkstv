import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "StreamFlix - Watch Movies & TV Shows Online",
  description: "Stream unlimited movies and TV shows on your favorite devices. Watch anywhere. Cancel anytime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}