import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D House Viewer - Next.js & Three.js",
  description: "Interactive 3D residential architectural model with rooftop solar array rendered using Next.js and Three.js / React Three Fiber.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
