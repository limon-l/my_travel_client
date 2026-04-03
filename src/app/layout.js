import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/SessionProvider";
import { Toaster } from "react-hot-toast";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "Wanderlust Agency",
  description: "Premium Tour Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable}`}>
        <AuthProvider>
          <div className="site-chrome">
            <Navbar />
            {children}
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
