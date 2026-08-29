import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VedaAI - AI Assessment Extraction & Answer Mapping",
  description: "Upload question papers and student answer sheets to view exact region mapping and AI grading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f5f5] text-[#111] antialiased selection:bg-[#ff5a1f] selection:text-white">
        {children}
      </body>
    </html>
  );
}
