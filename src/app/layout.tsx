import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "TimeSync - Find the Perfect Trip Time",
  description:
    "A modern group scheduling app to find when everyone is available. Create trips, share with your group, and discover the best travel times instantly.",
  keywords: ["scheduling", "trip", "travel", "doodle", "when2meet", "availability"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
            <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl" />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}

