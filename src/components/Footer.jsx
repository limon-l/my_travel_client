import Link from "next/link";
import { Instagram, Linkedin, Map, Facebook, X } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(45,212,191,0.2),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(56,189,248,0.16),transparent_32%)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-linear-to-br from-teal-500 to-cyan-600 text-white p-1.5 rounded-lg shadow-lg shadow-teal-700/30 group-hover:scale-105 transition">
                <Map size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Wanderlust<span className="text-teal-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Crafting unforgettable journeys for the modern explorer. We
              believe in sustainable, authentic travel experiences.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Stay Connected</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="#"
                className="bg-slate-800 p-2 rounded-lg hover:bg-teal-600 hover:text-white transition lift-hover">
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="bg-slate-800 p-2 rounded-lg hover:bg-teal-600 hover:text-white transition lift-hover">
                <X size={18} />
              </a>
              <a
                href="#"
                className="bg-slate-800 p-2 rounded-lg hover:bg-teal-600 hover:text-white transition lift-hover">
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="bg-slate-800 p-2 rounded-lg hover:bg-teal-600 hover:text-white transition lift-hover">
                <Linkedin size={18} />
              </a>
            </div>
            <p className="text-xs text-slate-500">
              © 2025 Wanderlust Agency.
              <br />
              All rights reserved.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          Designed with Next.js & Tailwind CSS
        </div>
      </div>
    </footer>
  );
}
