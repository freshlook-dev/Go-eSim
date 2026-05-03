import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Go eSim | Travel data that lands with you",
  description: "Browse and buy eSIM data plans for international travel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f6f8ff] text-[#111827]">
        <div className="bg-[#ef1b2d] px-5 py-2 text-center text-xs font-black text-white sm:text-sm">
          Go eSim travel data is ready before you land. Choose a destination, install your eSIM, and stay connected.
        </div>
        <header className="sticky top-0 z-50 border-b border-[#dbe4ff] bg-white/92 shadow-sm shadow-[#174ea6]/5 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center" aria-label="Go eSim home">
              <img
                src="/logo-cropped.png?v=3"
                alt="Go eSim"
                className="h-12 w-auto object-contain"
              />
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-bold text-[#31507e] md:flex">
              <Link href="/" className="transition hover:text-[#ef1b2d]">
                Destinations
              </Link>
              <Link href="/refill" className="transition hover:text-[#ef1b2d]">
                Refill
              </Link>
              <Link href="/check-balance" className="transition hover:text-[#ef1b2d]">
                Check balance
              </Link>
              <a href="#how-it-works" className="transition hover:text-[#ef1b2d]">
                How it works
              </a>
              <a href="#support" className="transition hover:text-[#ef1b2d]">
                Support
              </a>
            </nav>

            <Link
              href="/"
              className="rounded-lg bg-[#ef1b2d] px-4 py-2 text-sm font-black text-white shadow-sm shadow-red-500/20 transition hover:bg-[#d91628]"
            >
              Browse plans
            </Link>
          </div>
        </header>

        <main className="min-h-[calc(100vh-17rem)]">{children}</main>

        <footer id="support" className="border-t border-[#dbe4ff] bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
            <div>
              <img
                src="/logo-cropped.png?v=3"
                alt="Go eSim"
                className="mb-3 h-16 w-auto object-contain"
              />
              <p className="max-w-sm text-sm leading-6 text-[#53637f]">
                Fast travel data plans for people who want to land connected, skip roaming surprises,
                and keep moving.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-black text-[#102b68]">Company</h2>
              <div className="grid gap-2 text-sm text-[#53637f]">
                <Link href="/" className="hover:text-[#ef1b2d]">
                  Destinations
                </Link>
                <Link href="/refill" className="hover:text-[#ef1b2d]">
                  Refill
                </Link>
                <Link href="/check-balance" className="hover:text-[#ef1b2d]">
                  Check balance
                </Link>
                <a href="#how-it-works" className="hover:text-[#ef1b2d]">
                  How it works
                </a>
                <a href="mailto:support@goesim.example" className="hover:text-[#ef1b2d]">
                  Contact support
                </a>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-black text-[#102b68]">Travel ready</h2>
              <p className="text-sm leading-6 text-[#53637f]">
                Instant QR delivery, transparent pricing, and simple activation instructions after purchase.
              </p>
            </div>
          </div>
          <div className="border-t border-[#dbe4ff] px-5 py-5 text-center text-xs text-[#66748d]">
            © 2026 Go eSim. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
