"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/public/images/logo.png";

// Dashboard URL - defaults to app.schooliat.com
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.schooliat.com";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-white shadow-md border-b border-gray-200 transition-all duration-300 ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3" aria-label="SchooliAt Home">
            <Image
              src={logo}
              alt="SchooliAt Logo"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10"
              priority
            />
            <span className="font-bold text-lg sm:text-xl lg:text-2xl text-blue-900">
              SchooliAt
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-6 xl:gap-8 text-gray-700 font-medium">
          <Link
            href="/"
            className="hover:text-[#6f8f3e] transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="hover:text-[#6f8f3e] transition-colors duration-200"
          >
            About Us
          </Link>
          <a
            href="#features"
            className="hover:text-[#6f8f3e] transition-colors duration-200"
          >
            Features
          </a>
          <Link
            href="/opportunity"
            className="hover:text-[#6f8f3e] transition-colors duration-200"
          >
            Opportunity
          </Link>
        </nav>

        {/* Desktop CTA Button */}
        <a
          href={DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:block bg-[#6f8f3e] text-white px-5 xl:px-6 py-2.5 rounded-lg hover:bg-[#5a752f] transition-all duration-300 ease-in-out shadow-md hover:shadow-xl hover:shadow-[#6f8f3e]/30 hover:-translate-y-0.5 active:scale-95 text-sm xl:text-base"
        >
          Login →
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 text-gray-700 hover:text-[#6f8f3e] transition-all duration-200 ease-in-out rounded-md hover:bg-gray-100 active:scale-95"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X size={24} className="w-6 h-6" />
          ) : (
            <Menu size={24} className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block py-2 text-gray-700 hover:text-[#6f8f3e] transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="block py-2 text-gray-700 hover:text-[#6f8f3e] transition-colors font-medium"
            >
              About Us
            </Link>
            <a
              href="#features"
              onClick={closeMobileMenu}
              className="block py-2 text-gray-700 hover:text-[#6f8f3e] transition-colors font-medium"
            >
              Features
            </a>
            <Link
              href="/opportunity"
              onClick={closeMobileMenu}
              className="block py-2 text-gray-700 hover:text-[#6f8f3e] transition-colors font-medium"
            >
              Opportunity
            </Link>
            <a
              href={DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="block mt-4 bg-[#6f8f3e] text-white px-6 py-3 rounded-lg hover:bg-[#5a752f] transition-all duration-300 ease-in-out shadow-md hover:shadow-xl hover:shadow-[#6f8f3e]/30 hover:-translate-y-0.5 active:scale-95 text-center font-medium"
            >
              Login →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
