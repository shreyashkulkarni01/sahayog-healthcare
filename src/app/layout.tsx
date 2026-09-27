import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarePulse - Unified Healthcare Coordination Platform",
  description: "Unified appointment management and emergency coordination for clinics and patients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
