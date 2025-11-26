"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  Map,
  Calendar,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isAdmin = session?.user?.email === "admin@wanderlust.com";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Destinations", href: "/tours" },
    { name: "Packages", href: "/packages" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-teal-600 text-white p-1.5 rounded-lg group-hover:bg-teal-700 transition">
              <Map size={24} />
            </div>
            <span
              className={`text-2xl font-bold tracking-tight ${
                isScrolled
                  ? "text-slate-800"
                  : "text-slate-800 lg:text-slate-900"
              }`}>
              Wanderlust<span className="text-teal-600">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-teal-600 ${
                  isActive(link.href)
                    ? "text-teal-600 font-bold"
                    : "text-slate-600"
                }`}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            {!session ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-teal-600 font-medium text-sm">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="btn-primary px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-teal-900/20">
                  Get Started
                </Link>
              </div>
            ) : (
              <div
                className="relative py-2"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}>
                <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 pl-1 pr-3 py-1 rounded-full transition">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${session.user.name}&background=0d9488&color=fff`}
                    alt="User"
                    width={32}
                    height={32}
                    unoptimized
                    className="rounded-full border border-slate-200"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {session.user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                      <p className="text-sm font-bold text-slate-800">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user.email}
                      </p>
                      {isAdmin && (
                        <span className="mt-1 inline-block px-2 py-0.5 text-[10px] bg-teal-100 text-teal-700 rounded-full font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <>
                        <Link
                          href="/dashboard/add"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition">
                          <Plus size={16} /> Add Product
                        </Link>
                        <Link
                          href="/dashboard/manage"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition">
                          <Settings size={16} /> Manage Products
                        </Link>
                      </>
                    )}

                    {!isAdmin && (
                      <>
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition">
                          <User size={16} /> My Profile
                        </Link>
                        <Link
                          href="/dashboard/bookings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition">
                          <Calendar size={16} /> My Bookings
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-800">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-lg absolute w-full">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block text-slate-600 font-medium">
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
