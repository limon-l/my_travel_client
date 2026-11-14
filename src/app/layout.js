import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/SessionProvider";
import { Toaster } from "react-hot-toast";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wanderlust Atlas — Availability-aware travel requests",
    template: "%s · Wanderlust Atlas",
  },
  description:
    "Browse published departures, request a place, and track the real decision from operations. No invented ratings, no payment processing — every status reflects the stored booking record.",
  applicationName: "Wanderlust Atlas",
  authors: [{ name: "Wanderlust Atlas" }],
  openGraph: {
    type: "website",
    siteName: "Wanderlust Atlas",
    title: "Wanderlust Atlas — Availability-aware travel requests",
    description:
      "Browse published departures, request a place, and track the real decision from operations.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wanderlust Atlas",
    description:
      "Browse published departures, request a place, and track the real decision from operations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d2933",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable}`}>
        <AuthProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
