"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-teal-700 tracking-tighter">
              Wanderlust.
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-teal-600 font-medium">
              Home
            </Link>

            {!session ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-teal-600 font-medium">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-teal-600 text-white px-5 py-2 rounded-full hover:bg-teal-700 transition shadow-md">
                  Register
                </Link>
              </>
            ) : (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 focus:outline-none">
                  <span className="font-medium">
                    {session.user?.name || "Traveler"}
                  </span>
                  <User size={20} />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                  <div className="px-4 py-2 border-b text-xs text-gray-500">
                    {session.user?.email}
                  </div>
                  <Link
                    href="/tours"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    All Tours
                  </Link>
                  <Link
                    href="/dashboard/add"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Add Product
                  </Link>
                  <Link
                    href="/dashboard/manage"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Manage Products
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
